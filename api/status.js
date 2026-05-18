import { connectToDatabase } from './db.js';

const ONLINE_TIMEOUT = 45000;

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await connectToDatabase();
        const db = client.db('kurochat');
        const statusCollection = db.collection('user_status');

        if (req.method === 'GET') {
            const now = Date.now();
            const [kaiDoc, costaDoc] = await Promise.all([
                statusCollection.findOne({ user: 'kai' }),
                statusCollection.findOne({ user: 'costa' }),
            ]);

            res.status(200).json({
                kai: {
                    online: !!(kaiDoc && (now - kaiDoc.lastActivity) < ONLINE_TIMEOUT),
                    lastActivity: kaiDoc ? kaiDoc.lastActivity : null,
                },
                costa: {
                    online: !!(costaDoc && (now - costaDoc.lastActivity) < ONLINE_TIMEOUT),
                    lastActivity: costaDoc ? costaDoc.lastActivity : null,
                },
            });
        } else if (req.method === 'POST' || req.method === 'PUT') {
            const { user } = req.body;

            if (!user || (user !== 'kai' && user !== 'costa')) {
                return res.status(400).json({ error: 'Invalid user' });
            }

            const now = Date.now();
            await statusCollection.updateOne(
                { user },
                { $set: { user, lastActivity: now } },
                { upsert: true }
            );

            res.status(200).json({ user, online: true, timestamp: now });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
}
