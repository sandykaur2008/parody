import { MongoClient } from 'mongodb'; 
const url = 'mongodb://localhost:27017'; 

let client;
export default async function getDB(dbName = 'parodyApp') {
  if (!client) client = await MongoClient.connect(url); 
  return client.db(dbName); 
}

