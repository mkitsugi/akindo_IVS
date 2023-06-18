import json

import numpy as np
from scipy.spatial.distance import cosine

vector_1 = []
vector_2 = []
vector_3 = []

# vectorの生成
# もっと簡潔にする方法があるはず

# vector_1
with open("azure/TEST/strage_1/vector_store.json", "r") as f:
    sample_1 = json.load(f)

keys_list = list(sample_1.keys())
vector = sample_1[keys_list[0]]
vector_key_list = list(vector.keys())
for key in vector_key_list:
    vector_1.append(vector[key])

vector_1 = np.array(vector_1).reshape(-1)

# vector_2
with open("azure/TEST/strage_2/vector_store.json", "r") as f:
    sample_2 = json.load(f)

keys_list = list(sample_2.keys())
vector = sample_2[keys_list[0]]
vector_key_list = list(vector.keys())
for key in vector_key_list:
    vector_2.append(vector[key])

vector_2 = np.array(vector_2).reshape(-1)

# vector_3
with open("azure/TEST/strage_3/vector_store.json", "r") as f:
    sample_3 = json.load(f)

keys_list = list(sample_3.keys())
vector = sample_3[keys_list[0]]
vector_key_list = list(vector.keys())
for key in vector_key_list:
    vector_3.append(vector[key])

vector_3 = np.array(vector_3).reshape(-1)

# コサイン類似度の計算

print(vector_1.shape)
print(vector_2.shape)
print(vector_3.shape)
sim = 1 - cosine(vector_2, vector_3)
print(sim)
