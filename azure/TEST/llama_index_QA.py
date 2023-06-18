import os

import openai
from dotenv import load_dotenv
from llama_index import Document, LangchainEmbedding, ServiceContext, VectorStoreIndex

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
# エンベディングモデルをロードする
# この例では、デフォルトのエンベディングモデルを使用しています
service_context = ServiceContext.from_defaults()

# データの準備
data = [
    "そうなんだよね、最近困ってて…",
    "仕事が忙しくて、彼女も見つけられないんだよねー。いい人いないかな？優しくて明るい人！",
    "そうそう、趣味とかはゴルフやってるんだ〜♪",
    "僕の趣味覚えてるー？",
    "僕の名前はたくやです！",
    "あれ、相談乗ってくれないの？🥺",
    "僕の名前を覚えてくれる？拓也って言うんだけど",
    "僕の名前を覚えてるか教えて？",
    "僕の趣味は？",
    "僕の趣味覚えてる？",
    "僕のの好きなものは唐揚げなんだー",
]

documents = [Document(text=item) for item in data]

# インデックスを作成する
index = VectorStoreIndex.from_documents(documents, service_context=service_context)

# クエリエンジンを生成する
query_engine = index.as_query_engine()

# クエリを投げる
qestion = "僕の好きな食べ物は？"
response = query_engine.query(qestion)
print(response)
# >>> 唐揚げです。
