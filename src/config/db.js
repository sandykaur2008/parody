import { MongoClient } from 'mongodb'; 

let client;
export default async function getDB() {
  if (!client) client = await MongoClient.connect(process.env.URL); 
  return client.db(process.env.DB_NAME); 
}

