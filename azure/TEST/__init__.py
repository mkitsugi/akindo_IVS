import os
import openai
from azure.functions import HttpRequest, HttpResponse
from dotenv import load_dotenv

def main(req: HttpRequest) -> HttpResponse:
    load_dotenv()
    OPENAI_KEY = os.environ.get('API_KEY')
    openai.api_key = OPENAI_KEY

    messages = [] 
    max_messages = 10 

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

    messages.append({"role": "system", "content": base_prompt})

    initial_message = req.params.get('message')
    if not initial_message:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            initial_message = req_body.get('message')

    if initial_message:
        messages.append({"role": "user", "content": initial_message})

        response = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k-0613", messages=messages)
        ai_response = response["choices"][0]["message"]["content"]

        return HttpResponse(ai_response)
    else:
        return HttpResponse("Please pass a message on the query string or in the request body", status_code=400)
