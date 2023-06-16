import cosmosClient from "@/utlis/cosmosClient";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { chatRoomId } = req.query; // Use req.query instead of req.body

    // Validate the incoming data
    if (typeof chatRoomId !== "string") {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // cosmosDBからChatRoomを取得
    const { resources: chatRoom } = await cosmosClient.database
      .container("ChatRooms")
      .items.query({
        query: "SELECT * FROM ChatRooms c WHERE c.id = @chatRoomId",
        parameters: [
          {
            name: "@chatRoomId",
            value: chatRoomId,
          },
        ],
      })
      .fetchAll();

    console.log("chatRooms",chatRoom);

    res.status(200).json(chatRoom);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default handler;
