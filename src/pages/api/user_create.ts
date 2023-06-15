import type { NextApiRequest, NextApiResponse } from "next";
import cosmosClient from "@/utlis/cosmosClient";
import { v4 as uuidv4 } from "uuid";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { age, gender, job, name } = req.body;

    // Validate the incoming data
    if (
      typeof age !== "number" ||
      !Number.isInteger(age) ||
      typeof gender !== "string" ||
      typeof job !== "string" ||
      typeof name !== "string"
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // カスタム項目の追加
    const defaultChatId = uuidv4();

    //cosmosDBにUserを追加
    const { resource: createdItem } = await cosmosClient.database
      .container("Users")
      .items.create({
        age,
        gender,
        job,
        name,
        imgSrc : "",
        createdAt: Date.now()
      });

    // chatsコンテナにchatroomを生成
    const { resource: createdChatRoom } = await cosmosClient.database.container("ChatRooms").items.create({
      participants_id : [createdItem?.id, "AI"],
      createdAt : Date.now()
    });

    // 生成したChatroomに最初のチャットを投稿
    await cosmosClient.database.container("Chats").items.create({
      chat_room_id : createdChatRoom?.id,
      createdAt : Date.now(),
      user_id : "AI",
      message : "やっほー"
    })

    res.status(201).json(createdItem);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
