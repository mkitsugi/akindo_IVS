import json
import logging
import os
import uuid
from asyncio import exceptions

import openai
import requests
from azure.cosmos import CosmosClient, exceptions
from azure.functions import HttpRequest, HttpResponse
from dotenv import load_dotenv
from langchain import LLMChain, PromptTemplate
from langchain.chains import ConversationChain
from langchain.chat_models import ChatOpenAI
from langchain.memory import (
    ChatMessageHistory,
    ConversationBufferMemory,
    ConversationEntityMemory,
)
from langchain.schema import AIMessage, HumanMessage

from .db_check import check_db

# APIキーの取得
load_dotenv()
OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
openai.api_key = OPENAI_KEY

# function_callingのAPIURLの取得
function_calling_url = os.environ.get("FUNCTION_CALLING_URL")

# Cosmos DB接続設定
COSMOS_DB_CONNECTION_STR = os.environ.get("COSMOS_DB_CONNECTION_STR")
DATABASE_NAME = "KG_AK"
client = CosmosClient.from_connection_string(COSMOS_DB_CONNECTION_STR)
database = client.get_database_client(DATABASE_NAME)
chat_container = database.get_container_client("Chats")
user_container = database.get_container_client("Users")
prompt_container = database.get_container_client("Prompts")
pref_container = database.get_container_client("Pref")

# Prompt保管用のitem_id(仮置き)
item_id = "a085dd38-9318-48cc-a8f4-49f0e4866190"

# llmモデルの設定
llm = ChatOpenAI(temperature=0.3, model="gpt-3.5-turbo-16k-0613")


# プロンプトの取得
def get_prompts():
    item_id = "a085dd38-9318-48cc-a8f4-49f0e4866190"
    item = prompt_container.read_item(item=item_id, partition_key=item_id)
    return item


# ユーザー情報の取得
def get_user(user_id: str):
    user = user_container.read_item(item=user_id, partition_key=user_id)
    return user


# ユーザー属性のアップロード
def upload_userpref(user_id: str, response: dict) -> None:
    try:
        if response != "":
            print("response:", response)
            response_dict = json.loads(response)
            response_dict["user_id"] = user_id
            response_dict["id"] = user_id

            print("response_dict:", response_dict)
            # Add data to container
            pref_container.upsert_item(response_dict)
            print("Data inserted successfully.")
    except exceptions.CosmosResourceNotFoundError:
        print("Error.")


def fetch_userpref(user_id: str):
    try:
        pref = pref_container.read_item(item=user_id, partition_key=user_id)
        return pref
    except exceptions.CosmosResourceNotFoundError:
        return {}


def update_userpref(new: dict) -> None:
    pref_container.upsert_item(new)


# 情報量の有無を確認する
def get_item_information(message: str, template: str) -> str:
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


# Function callingで使用するfunction
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
    # messageの箱定義
    messages = []

    # APIリクエストからParmasの受領
    initial_message = req.params.get("message")
    user_id = req.params.get("user_id")  # user_idをクライアント側から取得
    chatroomid = req.params.get("roomId")  # chatroomidをクライアント側から取得

    # req_bodyの取得
    if not initial_message:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            initial_message = req_body.get("message")  # メッセージをクライアント側から取得
            user_id = req_body.get("user_id")  # user_idをクライアント側から取得
            chatroomid = req_body.get("roomId")  # chatroomidをクライアント側から取得

    # promptsリストの受領
    prompts = get_prompts()

    # user属性の取得
    user = get_user(user_id)

    # メッセージにプロンプトを追加
    messages.append({"role": "system", "content": prompts["BASE_PROMPT"]})
    # メッセージにユーザーメッセージを追加
    messages.append({"role": "user", "content": initial_message})

    # 応答文から情報量の有無を確認する
    response = get_item_information(initial_message, prompts["ASK_QUESTION_TYPE_TEMPLATE"])
    print("情報量があるかないか:", response)

    if "情報量あり" in response:
        # openAIのresの取得
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo-16k-0613",
            messages=[
                {"role": "user", "content": initial_message},
            ],
            functions=functions,
            function_call="auto",
        )
        # resのmessage部分を取得
        message = response["choices"][0]["message"]

        # 関数を使用すると判断された場合
        if message.get("function_call"):
            # エラーハンドリング
            if "function_call" in message and "name" in message["function_call"]:
                # 関数の実行
                # 使うと判断された関数名
                function_name = message["function_call"]["name"]
                # TODO LLMだとブレがあるのでフォーマットがおかしい時はもう一回とかの処理入れる
                arguments = json.loads(message["function_call"]["arguments"])
                # property_listを取得
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

                # 関数の実行
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

                # この処理で作成されたresponseの整形処理
                pref_res = second_response.choices[0]["message"]["content"].strip()
                parsed_data = json.loads(pref_res)

                print("Second_response:XXXXX", pref_res)
                print(isinstance(parsed_data, dict))

                ###PrefDBへの反映
                # 現在のPrefデータの取得
                current_pref = fetch_userpref(user["id"])
                pref = current_pref["preferences"]
                # 現在のPrefデータがあれば新規のPrefデータの比較する

                if isinstance(parsed_data, dict):
                    pref = check_db(pref, parsed_data)
                    update_userpref(current_pref)

            else:
                function_name = "change_to_JSON"

    # APIリクエストからParmasの受領

    return
