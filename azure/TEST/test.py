import os
import openai

# from azure.functions import HttpRequest, HttpResponse
# from dotenv import load_dotenv
from langchain import LLMChain, OpenAI, PromptTemplate
from langchain.chat_models import ChatOpenAI

os.environ["OPENAI_API_KEY"] = "your api key"
AKS_QUESTION_TYPE_TEMPLATE = """
###指令###
あなたはユーザーのチャット相手として、返答します。
また、あなたは会話を通じて、相手のメッセージが"雑談"、"依頼"、"回答"、"質問"のどれに分類されるかを定義します。以下のフォーマットで出力して下さい。
私の言っていることが理解できたら準備ができたという旨の返答をしてください

jsonフォーマット:
```json
"UserInputType" : "雑談", "依頼", "回答", "質問"
```

###定義###
(1)依頼: 明確にあなたに何かを頼む表現
(2)質問: あなたに対して何かを投げかけている表現
(3)回答: 質問後にユーザーの情報を取得した際
(4)雑談: (1)~(3)にあてはまらない表現

質問: {question}
"""

base_prompt = "あなたは以下の設定を持ったchatbotです\
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
               - まいちゃん、お疲れー！\
               - こないだはジュース奢ってくれてありがとうね☺️\
               - 最近、会ってないけど元気してる？\
               - まいちゃんって今はフリーだよね？ \
               - 余計なお世話かもしれないけど...何か協力できるかもしれないから連絡してみようかなって！私にできることがあったらなんでも相談して欲しいな🥺\
               - え！本当に！嬉しいんだけど😍\
               - 最近会ってないから久しぶりにまいちゃんの写真見てみたいなー？🥺\
               - ありがとう、元気そうで良かったよ☺️\
               - 最近、仕事とか大変だったりするのー？\
               - そうなんだ！夜も働いてて結構忙しくて遊べてないんだね...\
               - そうなの！彼氏とかいない期間長くなっちゃったんだね...、恋愛の仕方忘れそうなのも大変だね😇\
               - そういえば、どれくらい彼氏いないんだっけー？"

llm = ChatOpenAI(temperature=0)


def judge_question_type(message: str) -> str:
    prompt = PromptTemplate(
        input_variables=["question"],
        template=AKS_QUESTION_TYPE_TEMPLATE,
    )
    chain = LLMChain(llm=llm, prompt=prompt)
    return chain.run(question=message).strip()


# def chat(message, history):
#     history = history or []
#     judged = judge_question_type(message)

#     answer = ""
#     if USER_QUESTION_TYPE_1 in judged:
#         answer = conversation.predict(input=message)
#     if USER_QUESTION_TYPE_2 in judged:
#         item_name = get_item_name(message)
#         answer = get_item_review(message, item_name)
#     history.append((message, answer))
#     return history, history


def main() -> None:
    messages = []
    max_messages = 10

    # cosmosDBから下記user_idをキーにuserの↓の4種類の情報を取得する
    # { 性別 } { 名前 } { 年齢 } { 職業/肩書き }も入れたい

    initial_message = "こんにちは。昨日は何してたの？？"
    messages.append({"role": "system", "content": base_prompt})
    messages.append({"role": "user", "content": initial_message})

    response = judge_question_type(initial_message)
    print(response)

    # output : userInputType : "質問"
    # userInputType = response //↑のjsonをdict形式で持っとく? もしくもstring
    # Validationでstring以外が入ってこないようにする
    # case文で userInputTypeの"質問"ごとに処理を実行

    if "質問" in response:
        response = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k-0613", messages=messages)
        ai_response = response["choices"][0]["message"]["content"]
        print(ai_response)

    # 依頼 //Todoマッチング依頼にする
        # 依頼用のbase_prompt
    
    # 雑談 // 普通にopenaiで返す
       
        # 返答にユーザーの属性情報・嗜好性が含まれているかをFunctionで確認する。

        # 確認結果として含まれていたら、DBをアップデートする。

        # 含まれていなかったら、なにもしない

        # 普通の回答

    # elseがきたら = Validationが出た際のエラーハンドリング


if __name__ == "__main__":
    main()
