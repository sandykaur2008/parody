'use strict'; 
import getDB from './db'; 

export async function openChatCol() {
  const db = await getDB(); 
  const col = db.collection('chat'); 
  return col; 
}   

export async function getChatCol() {
  const db = await getDB()
  const col = db.collection('chat'); 
  const chatMessages = await col.find({}); 
  const chatMessagesArray = chatMessages.toArray();  
  return chatMessagesArray; 
}  

