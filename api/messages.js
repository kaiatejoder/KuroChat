import { connectToDatabase } from './db.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('kurochat');
        const messagesCollection = db.collection('messages');

        if (req.method === 'GET') {
            const messages = await messagesCollection
                .find({})
                .sort({ timestamp: 1 })
                .toArray();
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

            await messagesCollection.insertOne(message);
            res.status(201).json(message);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
}
