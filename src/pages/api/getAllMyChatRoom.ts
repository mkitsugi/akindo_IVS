import cosmosClient from "@/utlis/cosmosClient";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { userId } = req.query; // Use req.query instead of req.body

    // Validate the incoming data
    if (typeof userId !== "string") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    console.log(userId);

    // cosmosDBからChatRoomを取得
    const { resources: chatRooms } = await cosmosClient.database
      .container("Chats")
      .items.query({
        query: `SELECT * FROM Chats c WHERE c.senderId = @userId or c.receiverId = @userId`,
        parameters: [
          {
            name: "@userId",
            value: userId,
          },
        ],
      })
      .fetchAll();

    console.log(chatRooms);

    res.status(200).json(chatRooms);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
