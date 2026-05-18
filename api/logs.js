import { connectToDatabase } from './db.js';

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
        const logsCollection = db.collection('logs');

        if (req.method === 'GET') {
            const logs = await logsCollection.find({}).sort({ timestamp: 1 }).toArray();
            const format = req.query.format || 'json';

            if (format === 'csv') {
                let csv = 'Timestamp,User,Message\n';
                logs.forEach(entry => {
                    const timestamp = new Date(entry.timestamp).toLocaleString('es-ES');
                    const text = `"${entry.text.replace(/"/g, '""')}"`;
                    csv += `${timestamp},${entry.user},${text}\n`;
                });
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="kurochat-log.csv"');
                res.status(200).send(csv);
            } else {
                res.status(200).json(logs);
            }
        } else if (req.method === 'POST' || req.method === 'PUT') {
            const { user, text, timestamp } = req.body;

            if (!user || !text) {
                return res.status(400).json({ error: 'Missing user or text' });
            }

            const entry = {
                timestamp: timestamp || new Date().toISOString(),
                user,
                text,
            };

            await logsCollection.insertOne(entry);
            const count = await logsCollection.countDocuments();
            res.status(201).json({ success: true, totalLogs: count });
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Logs error:', error);
        res.status(500).json({ error: 'Database connection failed' });
    }
}
