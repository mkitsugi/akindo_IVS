import { BlobServiceClient } from '@azure/storage-blob';
import { NextApiRequest,NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

    if (!connectionString || !containerName) {
    // Handle error
    throw new Error('Environment variables not found');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const uniqueId = uuidv4();
    const blobName =`${uniqueId}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);


    const base64 = req.body.file;
    const buffer = Buffer.from(base64, 'base64');
    
    try {
        const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);
        console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

        // Content-Typeの設定
        await blockBlobClient.setHTTPHeaders({
            blobContentType: 'image/png' // ここで適切なContent-Typeを指定します
        });

        // 保存した画像の参照 URL を生成
        const imageUrl = blockBlobClient.url;
        console.log(`Upload block blob ${blobName} successfully, url:`, imageUrl);
        return res.status(200).json({ message: 'Upload successful', imageUrl });

    } catch (error) {
        console.error('Error while uploading to Azure storage', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
}
