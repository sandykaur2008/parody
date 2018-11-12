import { MongoClient } from 'mongodb'; 
const url = 'mongodb://localhost:27017'; 

let client;
export default async function getDB() {
  if (!client) client = await MongoClient.connect(url); 
  return client.db(process.env.DB_NAME); 
}

