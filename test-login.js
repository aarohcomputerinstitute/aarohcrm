import http from 'http';

const data = JSON.stringify({ email: 'test@example.com', password: 'password' });

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

console.log('Sending request to http://127.0.0.1:3000/api/auth/login');

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.write(data);
req.end();

setTimeout(() => {
  console.log('\nClosing after 10 seconds...');
  process.exit();
}, 10000);
