import { BlobServiceClient } from '@azure/storage-blob';
import { NextApiRequest,NextApiResponse } from 'next';

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


    const blobName = 'blobName'; // Define your blob name. It could be the filename or any other unique name.
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const buffer = Buffer.from(req.body, 'binary');

    try {
        const uploadBlobResponse = await blockBlobClient.upload(buffer, buffer.length);
        console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
        return res.status(200).json({ message: 'Upload successful' });
    } catch (error) {
        console.error('Error while uploading to Azure storage', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
}
