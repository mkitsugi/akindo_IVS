import cosmosClient from "@/utlis/cosmosClient";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("req.body", req.body);

  if (req.method === "POST") {
    const { chatRoomId, user_id, message } = req.body;

    try {
      await cosmosClient.database
        .container("Chats")
        .items.create({
          chat_room_id : chatRoomId,
          user_id : user_id,
          message : message,
          createdAt : Date.now(),
        });

      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
export default handler;
