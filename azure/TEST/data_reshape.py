import json
import numpy as np
import pandas as pd

# Load data
with open("azure/TEST/sample.txt", "r") as f:
    # data = f.readlines()
    data = json.load(f)

print(data[0]["chat_room_id"])
print(len(data))
chat_room_id = []
user_id = []
messages = []

# とりあえずAIじゃなかったら全部取ってくる
for item in data:
    # id = item["chat_room_id"]
    # if id not in chat_room_id:
    #     chat_room_id.append(id)
    if item["user_id"] != "AI":
        messages.append(item["message"])

print(messages)

#userのチャットメッセージだけ取ってくる
#llama_indexにコピペで投げている