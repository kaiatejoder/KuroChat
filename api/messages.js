// In-memory message storage for Vercel (filesystem is read-only)
// Messages are stored in memory and will reset on function redeploy
let messages = [];

function loadMessages() {
    // In-memory storage - already loaded
}

function saveMessages() {
    // In-memory storage - already in memory
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