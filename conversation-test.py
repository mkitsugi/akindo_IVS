import os

import openai
from dotenv import load_dotenv

load_dotenv(".env")
OPENAI_KEY = os.environ.get("API-KEY")
# OpenAI APIのAPIキーの設定
openai.api_key = OPENAI_KEY

messages = []  # 新しくリストを定義する
max_messages = 10  # 最大メッセージ数を定義する

print("AIの性格を決めて下さい")

AI_input = input("AI: ")

# システムメッセージをmessagesリストに追加
messages.append({"role": "system", "content": AI_input})

while True:
    # ユーザーからの入力を取得する
    user_input = input("User: ")

    # endが入力された場合は、プログラムを終了する
    if user_input == "end":
        break

    # メッセージを追加する
    messages.append({"role": "user", "content": user_input})

    # APIにユーザーからの入力を送信し、AIからの応答を取得する
    response = openai.ChatCompletion.create(model="gpt-3.5-turbo-0301", messages=messages)

    # AIからの応答を取得する
    ai_response = response["choices"][0]["message"]["content"]

    # 応答を表示する
    print(f"AI: {ai_response}")

    # メッセージを追加する
    messages.append({"role": "assistant", "content": ai_response})

    # messagesリストの中身がmax_messagesを超えた場合、最初のuserとassistantの会話を削除する
    if len(messages) > max_messages * 2 + 1:  # システムメッセージが含まれているため、+1します
        messages.pop(1)  # システムメッセージの次のメッセージを削除
        messages.pop(1)  # その後のassistantメッセージを削除

    # !が入力された場合、messagesリストの中身を表示する
    if user_input == "!":
        print("messages:", messages)
