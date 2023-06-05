const express = require('express');
const morgan = require('morgan');     // HTTP request logger middleware for node.js
const { createProxyMiddleware } = require('http-proxy-middleware');  // Proxying some URLs can be useful when you have a separate API backend development server and you want to send API requests on the same domain.
const rateLimit = require('express-rate-limit');  // Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
const axios = require('axios');   // Promise based HTTP client for the browser and node.js

const { PORT } = require('./config/serverConfig');

const app = express();


const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,  // 2 minutes' time window 
	max: 5, // start blocking after 5 requests from same IP in 2 minutes 
})

app.use(morgan('combined'));   
app.use(limiter);
app.use('/bookingservice', async (req, res, next) => {
    console.log(req.headers['x-access-token']);
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isauthenticated', {
            headers: {
                'x-access-token': req.headers['x-access-token']
            }
        });
        console.log(response.data);
        if(response.data.success) {
            next();
        } else {
            return res.status(401).json({
                message: 'Unauthorised'
            })
        }
    } catch (error) {
        return res.status(401).json({
            message: 'Unauthorised'
        })
    }
})
app.use('/bookingservice', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true}));
app.get('/home', (req, res) => {
    return res.json({message: 'OK'});
})

app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});