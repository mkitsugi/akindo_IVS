import cosmosClient from "@/utlis/cosmosClient";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { chatRoomId } = req.query; // Use req.query instead of req.body

    // Validate the incoming data
    if (typeof chatRoomId !== "string") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    console.log("chat_room_id",chatRoomId);

    // cosmosDBからChatRoomを取得
    const { resources: chatRooms } = await cosmosClient.database
      .container("Chats")
      .items.query({
        query: "SELECT * FROM Chats c WHERE c.chat_room_id = @chatRoomId",
        parameters: [
          {
            name: "@chatRoomId",
            value: chatRoomId,
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
