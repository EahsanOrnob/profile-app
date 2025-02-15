// app/api/webhook/route.js
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs'; // Required for crypto and filesystem access

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const DB_PATH = path.join(process.cwd(), 'db.json');

async function validateSignature(body, headers) {
  const signature = headers.get('x-signature');
  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}


async function saveToDatabase(eventData) {
  try {
    // Read existing data
    const fileData = await fs.readFile(DB_PATH, 'utf8');
    const db = JSON.parse(fileData);
    db.events = db.events || [];
    db.events.push(eventData);
    
    // Write back to file
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    // Create new file if it doesn't exist
    if (error.code === 'ENOENT') {
      await fs.writeFile(DB_PATH, JSON.stringify({ events: [eventData] }, null, 2));
    } else {
      throw error;
    }
  }
}

export async function POST(request) {
  try {
    // Read request body once
    const bodyText = await request.text();

    // Validate signature using the raw text body
    const isValid = await validateSignature(bodyText, request.headers);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse JSON from body text
    const payload = JSON.parse(bodyText);
    if (!payload.eventType || !payload.data) {
      return NextResponse.json(
        { success: false, message: 'Invalid payload format' },
        { status: 400 }
      );
    }

    // Create event object
    const eventData = {
      eventType: payload.eventType,
      data: payload.data,
      timestamp: new Date().toISOString(),
    };

    // Store in database
    await saveToDatabase(eventData);

    return NextResponse.json(
      { success: true, message: 'Received' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
