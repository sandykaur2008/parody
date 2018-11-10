import { MongoClient } from 'mongodb'; 
const url = 'mongodb://localhost:27017'; 
import dotenv from 'dotenv';
dotenv.config();  
const env = process.env.NODE_ENV; 
const envString = env.toUpperCase(); 

if (envString === 'TEST') {
  var dbName = 'parodyTest';
}
else {
  var dbName = 'parodyApp';
}

let client;
export default async function getDB() {
  if (!client) client = await MongoClient.connect(url); 
  return client.db(dbName); 
}

