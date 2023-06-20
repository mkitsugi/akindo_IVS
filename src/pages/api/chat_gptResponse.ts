import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { message, user_id, roomId } = req.body;

  console.log(req.body)
  // AZURE_FUNCTION_URLが設定されていない場合にエラーをスロー
  if (!process.env.AZURE_FUNCTION_URL) {
    throw new Error('AZURE_FUNCTION_URL is not set');
  }

  try {
    const response = await axios.post(process.env.AZURE_FUNCTION_URL, { message, user_id, roomId });
    const reply = response.data;
    res.json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred when making the request to the Azure Function' });
  }
  

  
};
