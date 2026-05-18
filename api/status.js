// Track user online status with activity timestamps
// A user is considered online if their last activity was within the last 15 seconds

let userActivity = {
    kai: null,
    costa: null
};

const ONLINE_TIMEOUT = 45000; // 45 seconds

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
        // Get online status of both users
        const now = Date.now();
        const kaiOnline = userActivity.kai && (now - userActivity.kai) < ONLINE_TIMEOUT;
        const costaOnline = userActivity.costa && (now - userActivity.costa) < ONLINE_TIMEOUT;

        res.status(200).json({
            kai: {
                online: kaiOnline,
                lastActivity: userActivity.kai
            },
            costa: {
                online: costaOnline,
                lastActivity: userActivity.costa
            }
        });
    } else if (req.method === 'POST' || req.method === 'PUT') {
        // Update user activity timestamp
        const { user } = req.body;

        if (!user || (user !== 'kai' && user !== 'costa')) {
            return res.status(400).json({ error: 'Invalid user' });
        }

        userActivity[user] = Date.now();

        res.status(200).json({
            user,
            online: true,
            timestamp: userActivity[user]
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}
