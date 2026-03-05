const https = require('https');

const options = {
    hostname: '72.62.66.151',
    port: 443,
    path: '/jen/api/agent-context',
    method: 'GET',
    headers: {
        'Host': 'goldlab.store'
    },
    servername: 'goldlab.store', // Needed for SNI
    rejectUnauthorized: false
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => { console.log(data); });
});

req.on('error', (e) => {
    console.error(e);
});

req.end();
