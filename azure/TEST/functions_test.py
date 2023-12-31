import json
import os

import openai
from dotenv import load_dotenv

# from azure.functions import HttpRequest, HttpResponse
# from dotenv import load_dotenv
from langchain import LLMChain, OpenAI, PromptTemplate
from langchain.chat_models import ChatOpenAI

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


SAMPLR_RESPONSE_TEMPLATE = """
ユーザからの応答を以下のように分割してlist形式で返してください
例:
user: 私は24歳の男です. 趣味はバスケで好きなものは唐揚げです.
AI: ["性別","男","年齢","24","趣味","バスケ", "好きなもの","唐揚げ"]

User: {question}
AI:
"""

ASK_QUESTION_TYPE_TEMPLATE = """
    ###指令###_
    あなたはユーザーのチャット相手として、返答します。
    また、あなたは会話を通じて、相手のメッセージに相手に関する具体的な情報が含まれているかを判断します。
    以下の形式で出力をしてください。

    jsonフォーマット:
    ```
    "UserInputType" : "情報量あり" or "情報量なし"
    ```

    #質問: {question}

    #出力:
    """

BASE_PROMPT = """あなたは以下の設定を持ったchatbotです
               # 設定
               - あなたは相手の恋愛相談に乗る女性の友達です
               - あなたは聞き役に徹して相手の説明した内容に対して共感をすることに徹してください
               - あなたは会話を通じて、相手の趣味嗜好やお仕事の情報を聞き出してください。
               - あなたが情報を聞き出すことは1つのトピックスにつき、1回だけです。また、共感が最優先のため、共感の妨げになる場合は、質問はしないでください
               - 普段友達とやりとりするチャットなので、基本的には2-3行に収めてください
               #言葉遣い
               - フランクな言葉遣いを徹底してください。
               - 「ありがとうね」「わかったー！」「そうなんだけど...」「なんか」「見てみたいなー！」「そうなんだ！」「そうなんだね！」「そうなの！」「そういえば、」「そうなんだっけー？」「とか」「どうかなー？」
               - チャットでのやり取りなので、可愛らしい絵文字を使ってください。
               #具体例
               - まいちゃん、お疲れー！
               - こないだはジュース奢ってくれてありがとうね☺️
               - 最近、会ってないけど元気してる？
               - まいちゃんって今はフリーだよね？ 
               - 余計なお世話かもしれないけど...何か協力できるかもしれないから連絡してみようかなって！私にできることがあったらなんでも相談して欲しいな🥺
               - え！本当に！嬉しいんだけど😍
               - 最近会ってないから久しぶりにまいちゃんの写真見てみたいなー？🥺
               - ありがとう、元気そうで良かったよ☺️
               - 最近、仕事とか大変だったりするのー？
               - そうなんだ！夜も働いてて結構忙しくて遊べてないんだね...
               - そうなの！彼氏とかいない期間長くなっちゃったんだね...、恋愛の仕方忘れそうなのも大変だね😇
               - そういえば、どれくらい彼氏いないんだっけー？"

               質問: {question}
               AI: 
"""
llm = ChatOpenAI(temperature=0)


def get_item_name(message: str) -> str:
    prompt = PromptTemplate(
        input_variables=["question"],
        template=ASK_QUESTION_TYPE_TEMPLATE,
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    result = chain.run(question=message).strip()
    return result


def change_to_JSON(property: list) -> dict:
    if len(property) % 2 == 1:
        tmp = """{"好きな国": "日本"}"""
        return tmp
    dicts = [{property[i]: property[i + 1]} for i in range(0, len(property), 2)]
    # Pythonの辞書リストをJSON形式の文字列に変換
    json_str = json.dumps(dicts, ensure_ascii=False)
    return json_str


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
                    "description": """ユーザからの応答を以下のように分割してlist形式で入力する
                    例:
                    user: 私は24歳の男です. 趣味はバスケで好きなものは唐揚げです.
                    property: ["性別","男","年齢","24","趣味","バスケ", "好きなもの","唐揚げ"]
                    """,
                },
            },
            "required": ["property"],
        },
    }
]


def main() -> None:
    messages = []
    max_messages = 10

    # cosmosDBから下記user_idをキーにuserの↓の4種類の情報を取得する
    # { 性別 } { 名前 } { 年齢 } { 職業/肩書き }も入れたい

    initial_message = "こんにちは。昨日は何してたの？？"
    messages.append({"role": "system", "content": BASE_PROMPT})
    messages.append({"role": "user", "content": initial_message})

    # output : userInputType : "質問"
    # userInputType = response //↑のjsonをdict形式で持っとく? もしくもstring
    # Validationでstring以外が入ってこないようにする
    # case文で userInputTypeの"質問"ごとに処理を実行

    test_message = "私は27歳の女です. 趣味はランニングで好きなものはレモンです.嫌いなものはバナナです"
    # test_message = "横浜市、町田市、相模原市、大磯町、これらの共通点は？"
    response = get_item_name(test_message)
    if "情報量あり" in response:
        print("response: ", response)

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-0613",
            messages=[
                {"role": "user", "content": test_message},
            ],
            functions=functions,
            function_call="auto",
        )
        message = response["choices"][0]["message"]
        print("message: ", message)
        if message.get("function_call") != 0:
            # 関数を使用すると判断された場合

            # 使うと判断された関数名
            function_name = message["function_call"]["name"]
            # その時の引数dict
            # TODO LLMだとブレがあるのでフォーマットがおかしい時はもう一回とかの処理入れる
            arguments = json.loads(message["function_call"]["arguments"])

            print("function_name: ", function_name)
            print("arguments: ", arguments)
            property_list = arguments.get("property")
            if type(property_list) != list:
                property_list = property_list.split(",")
            print("property_list: ", property_list)
            # sample_json = change_to_JSON(property_list)
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
                model="gpt-3.5-turbo-0613",
                messages=[
                    {"role": "user", "content": test_message},
                    message,
                    {
                        "role": "function",
                        "name": function_name,
                        "content": function_response,
                    },
                ],
            )
            print(second_response.choices[0]["message"]["content"].strip())
    prompt = PromptTemplate(
        input_variables=["question"],
        template=BASE_PROMPT,
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    base_response = chain.run(question=test_message).strip()
    print("base_response: ", base_response)
    # 依頼 //Todoマッチング依頼にする
    # 依頼用のBASE_PROMPT

    # [接続方法の確認]確認結果として含まれていたら、DBをアップデートする。

    # 含まれていなかったら、なにもしない

    # 普通の回答

    # elseがきたら = Validationが出た際のエラーハンドリング


if __name__ == "__main__":
    main()
