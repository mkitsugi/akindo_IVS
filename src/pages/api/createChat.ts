import cosmosClient from "@/utlis/cosmosClient";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log("req.body", req.body);

  if (req.method === "POST") {
    const { chat } = req.body;

    // Validate the incoming data
    if (!chat) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // cosmosDBにChatを追加
    const { resource: createdItem } = await cosmosClient.database
      .container("Chats")
      .items.create({
        chat,
      });

    res.status(201).json(createdItem);
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};
export default handler;
