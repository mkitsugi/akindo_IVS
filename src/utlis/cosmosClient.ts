import { CosmosClient } from "@azure/cosmos";

// 環境変数から接続情報を取得
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseName = process.env.COSMOS_DB_DATABASE_NAME;
const containerName = process.env.COSMOS_DB_CONTAINER_NAME;

if (!endpoint) {
  throw new Error("Please define the COSMOS_DB_ENDPOINT environment variable");
}

if (!key) {
  throw new Error("Please define the COSMOS_DB_KEY environment variable");
}

if (!databaseName) {
  throw new Error("Please define the COSMOS_DB_DATABASE_NAME environment variable");
}

if (!containerName) {
  throw new Error("Please define the COSMOS_DB_CONTAINER_NAME environment variable");
}

// CosmosClientのインスタンスを作成
const client = new CosmosClient({ endpoint, key });

// データベースとコンテナへの参照を作成
const database = client.database(databaseName);
const container = database.container(containerName);

export default { client, database, container };
