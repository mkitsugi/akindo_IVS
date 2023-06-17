import os
import openai
import json
from azure.functions import HttpRequest, HttpResponse
from azure.cosmos import CosmosClient
from dotenv import load_dotenv

def main(req: HttpRequest) -> HttpResponse:
    load_dotenv()
    OPENAI_KEY = os.environ.get('OPENAI_KEY')
    openai.api_key = OPENAI_KEY

    # Cosmos DB接続設定
    COSMOS_DB_CONNECTION_STR = os.environ.get('COSMOS_DB_CONNECTION_STR')
    DATABASE_NAME = "KG_AK"
    CONTAINER_NAME = "Chats"

    client = CosmosClient.from_connection_string(COSMOS_DB_CONNECTION_STR)
    database = client.get_database_client(DATABASE_NAME)
    container = database.get_container_client(CONTAINER_NAME)

    messages = [] 
    max_messages = 10

    base_prompt = "あなたは友達として接してください"

    messages.append({"role": "system", "content": base_prompt})

    initial_message = req.params.get('message')
    user_id = req.params.get('user_id')  # user_idをクライアント側から取得
    chatroomid = req.params.get('chatroomid')  # chatroomidをクライアント側から取得


    if not initial_message:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            initial_message = req_body.get('message') #メッセージをクライアント側から取得
            user_id = req_body.get('user_id')  # user_idをクライアント側から取得
            chatroomid = req_body.get('chatroomid')  # chatroomidをクライアント側から取得

    # Cosmos DBからデータを取得
    query = f"SELECT * FROM c WHERE c.chat_room_id = '{chatroomid}'"
    items = list(container.query_items(
        query=query,
        enable_cross_partition_query=True
    ))


    if initial_message:
        messages.append({"role": "user", "content": initial_message})

        response = openai.ChatCompletion.create(model="gpt-3.5-turbo-16k-0613", messages=messages)
        ai_response = response["choices"][0]["message"]["content"]

        response_body = json.dumps({"ai_response": ai_response, "items": items}, ensure_ascii=False, indent=4)
        return HttpResponse(response_body)
        # return HttpResponse(ai_response, items)
    else:
        return HttpResponse("Please pass a message on the query string or in the request body", status_code=400)
