from asyncio import exceptions
import os
import openai
import json
import uuid
from azure.functions import HttpRequest, HttpResponse
from azure.cosmos import CosmosClient, exceptions
from langchain.memory import ConversationBufferMemory, ChatMessageHistory, ConversationEntityMemory
from langchain.schema import HumanMessage, AIMessage
from langchain.chains import ConversationChain
from langchain import LLMChain, PromptTemplate
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv

# APIキーの取得
load_dotenv()
OPENAI_KEY = os.environ.get('OPENAI_API_KEY')
openai.api_key = OPENAI_KEY

# Cosmos DB接続設定
COSMOS_DB_CONNECTION_STR = os.environ.get('COSMOS_DB_CONNECTION_STR')
DATABASE_NAME = "KG_AK"
client = CosmosClient.from_connection_string(COSMOS_DB_CONNECTION_STR)
database = client.get_database_client(DATABASE_NAME)
chat_container = database.get_container_client("Chats")
user_container = database.get_container_client("Users")
prompt_container = database.get_container_client("Prompts")
pref_container = database.get_container_client("Pref")

#Prompt保管用のitem_id(仮置き)
item_id = "a085dd38-9318-48cc-a8f4-49f0e4866190"

#llmモデルの設定
llm = ChatOpenAI(temperature=0.3,model="gpt-3.5-turbo-16k-0613")

#プロンプトの取得
def get_prompts():
    item_id = "a085dd38-9318-48cc-a8f4-49f0e4866190"
    item = prompt_container.read_item(item=item_id, partition_key=item_id)

    return item

#ユーザー情報の取得
def get_user(user_id : str):
    user = user_container.read_item(item=user_id, partition_key=user_id)
    return user

#ユーザー属性のアップロード
def upload_userpref(user_id:str, response:dict)-> None:
    try:
        if response != "":
            print("response:",response)
            response_dict = json.loads(response)
            response_dict["user_id"] = user_id
            response_dict["id"] = user_id

            print("response_dict:",response_dict)
            # Add data to container
            pref_container.upsert_item(response_dict)
            print("Data inserted successfully.")
    except exceptions.CosmosResourceNotFoundError:
        print("Error.")

def fetch_userpref(user_id:str):
    try:
        pref = pref_container.read_item(item=user_id, partition_key=user_id)
        return pref
    except exceptions.CosmosResourceNotFoundError:
        return {}
    
def update_userpref(current:dict,new:dict)-> None:

    existing_data = current
    
    # 既存データと新しいデータの整合性を確認
    merged_data = {**existing_data, **new}
    
    # 新しいデータが存在する場合はデータベースに更新
    if merged_data != existing_data:
        pref_container.upsert_item(merged_data)
    
    return merged_data

##プロンプトテンプレート
SUMMARY_QUESTION_TYPE_TEMPLATE="""
あなたはあなたが持っている情報を適切に要約して相手に説明するのが非常にうまいと思われている人間です。
ユーザーからの応答に対して適切に返してください

#応答: 

#出力: 

"""

base_prompt = """あなたは以下の設定を持ったchatbotです\
               # 設定\
               - あなたは相手の恋愛相談に乗る女性の友達です\
               - あなたは聞き役に徹して相手の説明した内容に対して共感をすることに徹してください\
               - あなたは会話を通じて、相手の趣味嗜好やお仕事の情報を聞き出してください。\
               - あなたが情報を聞き出すことは1つのトピックスにつき、1回だけです。また、共感が最優先のため、共感の妨げになる場合は、質問はしないでください\
               - 普段友達とやりとりするチャットなので、基本的には2-3行に収めてください\
               #言葉遣い\
               - フランクな言葉遣いを徹底してください。\
               - 「ありがとうね」「わかったー！」「そうなんだけど...」「なんか」「見てみたいなー！」「そうなんだ！」「そうなんだね！」「そうなの！」「そういえば、」「そうなんだっけー？」「とか」「どうかなー？」\
               - チャットでのやり取りなので、可愛らしい絵文字を使ってください。\
               #具体例\
               - ""名前が入ります"" ちゃん、お疲れー！\
               - こないだはジュース奢ってくれてありがとうね☺️\
               - 最近、会ってないけど元気してる？\
               - ""名前が入ります""って今はフリーだよね？ \
               - 余計なお世話かもしれないけど...何か協力できるかもしれないから連絡してみようかなって！私にできることがあったらなんでも相談して欲しいな🥺\
               - え！本当に！嬉しいんだけど😍\
               - 最近会ってないから久しぶりに""名前が入ります""の写真見てみたいなー？🥺\
               - ありがとう、元気そうで良かったよ☺️\
               - 最近、仕事とか大変だったりするのー？\
               - そうなんだ！夜も働いてて結構忙しくて遊べてないんだね...\
               - そうなの！彼氏とかいない期間長くなっちゃったんだね...、恋愛の仕方忘れそうなのも大変だね😇\
               - そういえば、どれくらい彼氏いないんだっけー？
               
               #ユーザー情報: {age} {name} {gender} {job}

               #会話履歴: {history}

               #入力: {input}

               #出力: 

               """


#分類処理
##プロンプトテンプレート
ASK_QUESTION_TYPE_TEMPLATE = """
    ###指令###_
    あなたはユーザーのチャット相手として、返答します。
    また、あなたは会話を通じて、相手のメッセージに相手に関する具体的な情報が含まれているかを判断します。
    以下の形式で出力をしてください。

    jsonフォーマット:
    ```
    "UserInputType" : "情報量あり" or "情報量なし"
    ```

    #質問: {userinput}

    #出力:
    """

##分類処理
def judge_conversation_type(userinput: str) -> str:

    prompt = PromptTemplate(
        input_variables=["userinput"],
        template=ASK_QUESTION_TYPE_TEMPLATE,
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain.run(userinput=userinput).strip()

#CosmosDBからデータを取得
def get_Chats_from_cosmos(chatroomid: str) -> list:
    query = f"SELECT * FROM c WHERE c.chat_room_id = '{chatroomid}'"
    Chats = list(chat_container.query_items(
        query=query,
        enable_cross_partition_query=True
    ))    
    return Chats

#Chatsをメモリー化して、出力
def output_from_memory(Chats: list, initial_message: str, userinfo:list,prompt: str):

    #userinfo
    age = userinfo["age"]
    gender = userinfo["gender"]
    job = userinfo["job"]
    name = userinfo["name"]

    # Initialize memory
    memory = ConversationBufferMemory(return_messages=True)
    # memory = ConversationEntityMemory(llm=llm)

    # Load messages into memory
    for chat in Chats:
        message = HumanMessage(content=chat['message']) if chat['user_id'] != 'AI' else AIMessage(content=chat['message'])

        # Add the message to the memory
        if isinstance(message, HumanMessage):
            memory.chat_memory.add_user_message(message.content)
        else:
            memory.chat_memory.add_ai_message(message.content)
    
    memory.chat_memory.add_user_message(f"ユーザー属性は'${age,gender,job,name}'です")

    prompt = PromptTemplate(template=prompt,input_variables=["history","input"]) 

    chain = ConversationChain(llm=llm, verbose=False, memory=memory,prompt=prompt)
    summary = chain.predict(input=initial_message)

    return summary

#情報量の有無を確認する
def get_item_information(message: str, template:str) -> str:

    prompt = PromptTemplate(
        input_variables=["userinput"],
        template=template,
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run(userinput=message).strip()
    return result


def change_to_JSON(property: list) -> dict:
    if len(property) % 2 == 1:
        tmp = """ {"like":[], "dislike":[]} """
        return tmp
    dicts = [{property[i]: property[i + 1]} for i in range(0, len(property), 2)]
    # Pythonの辞書リストをJSON形式の文字列に変換
    json_str = json.dumps(dicts, ensure_ascii=False)
    return json_str

#Function callingで使用するfunction
functions = [
    # AIが、質問に対してこの関数を使うかどうか、
    # また使う時の引数は何にするかを判断するための情報を与える
    {
        "name": "change_to_JSON",
        "description": "リスト形式からJSON形式に変換する",
        "parameters": {
            "type": "object",
            "properties": {
                # change_to_JSON関数の引数であるproperty引数の情報
                "property": {
                    "type": "string",
                    "description": """ユーザからの応答を以下のように分割してlist形式で入力する。Keyは文章形式ではなく簡潔な単語で示すこと。
                    例:
                    ###input###
                    user: 私は24歳の男です. 趣味はバスケで好きなものは唐揚げです.
                    ###output###
                    property: ["性別","男","年齢","24","趣味","バスケ", "好きなもの",["唐揚げ","夜景","トイプードル"]]
                    """,
                },
            },
            "required": ["property"],
        },
    }
]

def main(req: HttpRequest) -> HttpResponse:

    #messageの箱定義
    messages = []

    #APIリクエストの受領
    initial_message = req.params.get('message')
    user_id = req.params.get('user_id')  # user_idをクライアント側から取得
    chatroomid = req.params.get('roomId')  # chatroomidをクライアント側から取得
    if not initial_message:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            initial_message = req_body.get('message') #メッセージをクライアント側から取得
            user_id = req_body.get('user_id')  # user_idをクライアント側から取得
            chatroomid = req_body.get('roomId')  # chatroomidをクライアント側から取得

    #promptsリストの受領
    prompts = get_prompts()
    messages.append({"role": "system", "content": prompts["BASE_PROMPT"]})
    messages.append({"role": "user", "content": initial_message})

    #user属性の取得
    user = get_user(user_id)
    print("User:",user)

    #情報量の有無を確認する
    response = get_item_information(initial_message,prompts["ASK_QUESTION_TYPE_TEMPLATE"])
    print("情報量があるかないか:", response)

    if "情報量あり" in response:

        #openAIのresの取得
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-16k-0613",
            messages=[
                {"role": "user", "content": initial_message},
            ],
            functions=functions,
            function_call="auto",
        )

        #resのmessage部分を取得
        message = response["choices"][0]["message"]

        # 関数を使用すると判断された場合
        if message.get("function_call") != 0:
            
            #エラーハンドリング
            if "function_call" in message and "name" in message["function_call"]:
                # 使うと判断された関数名
                function_name = message["function_call"]["name"]
                # TODO LLMだとブレがあるのでフォーマットがおかしい時はもう一回とかの処理入れる
                arguments = json.loads(message["function_call"]["arguments"])
                #property_listを取得
                property_list = arguments.get("property")
                if type(property_list) != list:
                    property_list = property_list.split(",")

                function_response = globals()[function_name](property_list)

                print("function_response: ", function_response)

                messages.append(
                    {
                        "role": "function",
                        "name": function_name,
                        "content": function_response,
                    }
                )

                second_response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo-16k-0613",
                    messages=[
                        {"role": "user", "content": initial_message},
                        message,
                        {
                            "role": "function",
                            "name": function_name,
                            "content": function_response,
                        },
                    ],
                )

                current_pref = fetch_userpref(user["id"])
                print(current_pref)

                pref_res = second_response.choices[0]["message"]["content"].strip()
                parsed_data = json.loads(pref_res)
                print("Second_response:XXXXX",pref_res)

                print(isinstance(parsed_data, dict))

                if current_pref != {} and isinstance(parsed_data, dict):
                    print("step1:", current_pref)
                    update_userpref(current=current_pref,new=pref_res)
                else:
                    print("step2:", current_pref)
                    if isinstance(pref_res, dict):
                        print("step3:", parsed_data)
                        upload_userpref(user_id=user["id"],response=pref_res)

            else:
                function_name = "change_to_JSON"

    ##いずれのパターンでも処理する情報

    #ChatDBからデータの取得
    chatsoutput = get_Chats_from_cosmos(chatroomid=chatroomid)
    # print("Chats:", chatsoutput)
    #Returnとして返すプロンプトの生成
    output = output_from_memory(Chats=chatsoutput,initial_message=initial_message,userinfo=user,prompt=prompts["BASE_PROMPT"])

    if initial_message:
        # response_body = json.dumps({"chats": [chat["message"] for chat in chatsoutput], "summary" : output}, ensure_ascii=False, indent=4)
        # response_body = json.dumps({"chats": chatsoutput, "summary" : output}, ensure_ascii=False, indent=4)
        # return HttpResponse(response_body)
        # return json.dumps(prompts)
        return HttpResponse(output)
    else:
        return HttpResponse("Please pass a message on the query string or in the request body", status_code=400)
