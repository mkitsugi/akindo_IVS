import type { NextApiRequest, NextApiResponse } from 'next'
import cosmosClient  from '@/utlis/cosmosClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    const { userId, imageUrl } = req.body;

    console.log("userId", userId);
    console.log("imageUrl", imageUrl);
  
    if (!userId) {
      res.status(400).json({ error: 'Missing user id' });
      return;
    }
  
    try {
        const container = cosmosClient.database.container("Users")
        const { resource: existingItem } = await container.item(userId, userId).read();

        const updatedItem = {
            ...existingItem,
            imgSrc: imageUrl,
        };

        console.log("exits",existingItem);

        const { resource: updatedResource } = await container.item(userId,userId).replace(updatedItem);
        res.status(200).json({ message: `Updated user ${userId} imgSrc to: ${imageUrl}` });

    } catch (error) {
        console.error('Error updating user imgSrc:', error);
        res.status(500).json({ error: 'Error fetching user data from Cosmos DB' });
    }
  }