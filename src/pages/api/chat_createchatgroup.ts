import type { NextApiRequest, NextApiResponse } from "next";
import cosmosClient from "@/utlis/cosmosClient";
import { v4 as uuidv4 } from "uuid";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { userId, name, gender } = req.body;

    // chatsコンテナにchatroomを生成
    const { resource: createdChatRoom } = await cosmosClient.database.container("ChatRooms").items.create({
      participants_id : [userId, "AI", "01816075-d490-411e-ad15-6c9c2a622a50"],
      createdAt : Date.now()
    });

    // 名前に対する敬称を設定
    const honorific = gender === "男性" ? "くん" : "ちゃん";
    const customizedMessage = `${name}${honorific}とじゅんくん、招待したよー！\n\n自由に話してもらって大丈夫だけど、困ったら私に声かけてねー！じゃーねー！`;    

    // 生成したChatroomに最初のチャットを投稿
    await cosmosClient.database.container("Chats").items.create({
      chat_room_id : createdChatRoom?.id,
      createdAt : Date.now(),
      user_id : "AI",
      message : customizedMessage
    })

    res.status(201).json(createdChatRoom?.id);

  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
