import fs from 'fs';
import path from 'path';

let messages = [];

const dbPath = path.join(process.cwd(), 'data.json');

function loadMessages() {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf-8');
            messages = JSON.parse(data);
        }
    } catch (error) {
        messages = [];
    }
}

function saveMessages() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(messages, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error saving messages:', error);
    }
}

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    loadMessages();

    if (req.method === 'GET') {
        res.status(200).json(messages);
    } else if (req.method === 'POST') {
        const { user, text } = req.body;

        if (!user || !text) {
            return res.status(400).json({ error: 'Missing user or text' });
        }

        const message = {
            id: Date.now(),
            user,
            text,
            timestamp: new Date().toISOString()
        };

        messages.push(message);
        saveMessages();

        res.status(201).json(message);
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}