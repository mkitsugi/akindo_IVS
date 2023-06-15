import type { NextApiRequest, NextApiResponse } from 'next'
import cosmosClient  from '@/utlis/cosmosClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const userId = req.query.id as string;
  
    if (!userId) {
      res.status(400).json({ error: 'Missing user id' });
      return;
    }
  
    try {
      const { resource: user } = await cosmosClient.database.container("Users").item(userId, userId).read();
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user data from Cosmos DB' });
    }
  }