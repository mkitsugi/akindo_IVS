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


def check_db(db_data: dict, new_item: dict) -> dict:
    # jsonで読み込み
    # db_data = db_data["preferences"]
    new_item = new_item["preferences"]

    # dbのpropertyのリスト
    db_property_list = db_data.keys()
    new_property_list = new_item.keys()

    print(db_property_list)
    print(new_property_list)
    for key in db_property_list:
        if isinstance(db_data[key], str):
            db_data[key] = [db_data[key]]

    for key in new_property_list:
        if isinstance(new_item[key], str):
            new_item[key] = [new_item[key]]

    # dbのpropertyのリストにないものを追加
    for key in new_property_list:
        if key in db_property_list:
            for value in new_item[key]:
                print("valuse:", value)
                db_data[key].append(value)
        else:
            db_data[key] = new_item[key]

    # 重複の削除
    for key in db_property_list:
        db_data[key] = list(set(db_data[key]))

    return db_data
