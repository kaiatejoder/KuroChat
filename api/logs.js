// In-memory log storage for Vercel
let activityLog = [];

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        // Return all logs as CSV or JSON
        const format = req.query.format || 'json';

        if (format === 'csv') {
            let csv = 'Timestamp,User,Message\n';
            activityLog.forEach(entry => {
                const timestamp = new Date(entry.timestamp).toLocaleString('es-ES');
                const user = entry.user;
                const text = `"${entry.text.replace(/"/g, '""')}"`;
                csv += `${timestamp},${user},${text}\n`;
            });
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="kurochat-log.csv"');
            res.status(200).send(csv);
        } else {
            res.status(200).json(activityLog);
        }
    } else if (req.method === 'POST' || req.method === 'PUT') {
        // Add new log entry
        const { user, text, timestamp } = req.body;

        if (!user || !text) {
            return res.status(400).json({ error: 'Missing user or text' });
        }

        activityLog.push({
            timestamp: timestamp || new Date().toISOString(),
            user,
            text
        });

        res.status(201).json({
            success: true,
            totalLogs: activityLog.length
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
