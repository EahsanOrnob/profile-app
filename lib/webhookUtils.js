import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DB_PATH = path.join(process.cwd(), 'db.json');

// Validate HMAC signature
export function validateSignature(rawBody, signature) {
  const generatedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature),
    Buffer.from(signature || '')
  );
}

// Store event in JSON file
export async function storeWebhookEvent(event) {
  try {
    // Read existing data
    const fileData = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileData);
    db.events = db.events || [];
    db.events.push(event);
    
    // Write back to file
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    // Create new file if doesn't exist
    if (error.code === 'ENOENT') {
      await fs.writeFile(DB_PATH, JSON.stringify({ events: [event] }, null, 2));
    } else {
      throw error;
    }
  }
}