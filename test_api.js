const http = require('http');

const options = {
    hostname: 'localhost',
    port: 1433,
    path: '/api/availability?professionalId=1&start=2024-01-01T09:00:00&end=2024-01-01T10:00:00',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
