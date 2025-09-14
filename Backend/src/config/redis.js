const {createClient} = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-15585.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 15585
    }
});

// Chatgpt

// redisClient.on('error', (err) => {
//     console.error('❌ Redis connection error:', err.message);
//     // Optional: gracefully shutdown or alert
// });

module.exports = redisClient;
