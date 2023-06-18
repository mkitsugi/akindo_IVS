import os
import openai
import json
from azure.functions import HttpRequest, HttpResponse
from azure.cosmos import CosmosClient
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
CONTAINER_NAME = "Chats"
client = CosmosClient.from_connection_string(COSMOS_DB_CONNECTION_STR)
database = client.get_database_client(DATABASE_NAME)
container = database.get_container_client(CONTAINER_NAME)

#llmモデルの設定
llm = ChatOpenAI(temperature=0.3,model="gpt-3.5-turbo-16k-0613")

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
    Chats = list(container.query_items(
        query=query,
        enable_cross_partition_query=True
    ))    
    return Chats


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
               

               #会話履歴: {history}

               #入力: {input}

               #出力: 

               """

#Chatsをメモリー化して、出力
def output_from_memory(Chats: list, initial_message: str):
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

    prompt = PromptTemplate(template=base_prompt,input_variables=["history","input"]) 

    chain = ConversationChain(llm=llm, verbose=True, memory=memory,prompt=prompt)
    summary = chain.predict(input=initial_message)

    return summary


def main(req: HttpRequest) -> HttpResponse:

    initial_message = req.params.get('message')
    # user_id = req.params.get('user_id')  # user_idをクライアント側から取得
    chatroomid = req.params.get('roomId')  # chatroomidをクライアント側から取得

    if not initial_message:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            initial_message = req_body.get('message') #メッセージをクライアント側から取得
            # user_id = req_body.get('user_id')  # user_idをクライアント側から取得
            chatroomid = req_body.get('roomId')  # chatroomidをクライアント側から取得
 
    if initial_message:
        # messages.append({"role": "user", "content": initial_message})
        response = judge_conversation_type(userinput=initial_message)
        # response = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k-0613", messages=messages)
        # ai_response = response["choices"][0]["message"]["content"]
        chatsoutput = get_Chats_from_cosmos(chatroomid=chatroomid)
        output = output_from_memory(Chats=chatsoutput,initial_message=initial_message)
        # response_body = json.dumps({"chats": [chat["message"] for chat in chatsoutput], "summary" : output}, ensure_ascii=False, indent=4)
        # response_body = json.dumps({"chats": chatsoutput, "summary" : output}, ensure_ascii=False, indent=4)
        # return HttpResponse(response_body)
        return HttpResponse(output)
    else:
        return HttpResponse("Please pass a message on the query string or in the request body", status_code=400)
