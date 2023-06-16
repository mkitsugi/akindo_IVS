import cosmosClient from "@/utlis/cosmosClient";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { userId } = req.query; // Use req.query instead of req.body

    // Validate the incoming data
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // cosmosDBからChatRoomを取得
    const { resources: chatRooms } = await cosmosClient.database
      .container("ChatRooms")
      .items.query({
        // query: "SELECT m.chatId, m.senderId, m.receiverId, m.message, m.chatRoomId, m.createdAt FROM ChatRooms c JOIN m IN c.messages WHERE m.senderId = @userId OR m.receiverId = @userId",
        query: "SELECT * FROM ChatRooms c WHERE ARRAY_CONTAINS(c.participants_id, @userId)",
        parameters: [
          {
            name: "@userId",
            value: userId,
          },
        ],
      })
      .fetchAll();

    console.log("chatRooms",chatRooms);

    res.status(200).json(chatRooms);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
