import json

import numpy as np

db_data = """{
    "property": {
        "性別": "男",
        "年齢": "24",
        "趣味": "バスケ",
        "好きなもの": ["唐揚げ", "夜景", "トイプードル"]
    }
}"""

new_data = """{
    "property": {
        "性別": "男",
        "年齢": "24",
        "趣味": "バスケ",
        "好きなもの": ["麻婆豆腐", "唐揚げ"],
        "好きな場所": ["カフェ", "いえ"]
    }
}"""


def check_db(db_data: json, new_item: json) -> json:
    # jsonで読み込み
    db_data = json.loads(db_data)["property"]
    new_item = json.loads(new_item)["property"]

    # dbのpropertyのリスト
    db_property_list = db_data.keys()
    new_property_list = new_item.keys()

    # dbのpropertyのリストにないものを追加
    for key in new_property_list:
        if key in db_property_list:
            if isinstance(db_data[key], str):
                db_data[key] = [db_data[key]]
                print(db_data[key])
            if isinstance(new_item[key], str):
                new_item[key] = [new_item[key]]
                print(new_item[key])
            for value in new_item[key]:
                print("valuse:", value)
                db_data[key].append(value)
        else:
            db_data[key] = new_item[key]

    # 重複の削除
    for key in db_property_list:
        db_data[key] = list(set(db_data[key]))

    return db_data


db = check_db(db_data, new_data)
print("db:\n", db)
