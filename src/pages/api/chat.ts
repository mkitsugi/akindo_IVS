import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { message } = req.body;

  // AZURE_FUNCTION_URLが設定されていない場合にエラーをスロー
  if (!process.env.AZURE_FUNCTION_URL) {
    throw new Error('AZURE_FUNCTION_URL is not set');
  }

  const response = await axios.post(process.env.AZURE_FUNCTION_URL, { message });
  const reply = response.data;
  res.json(reply);
};
