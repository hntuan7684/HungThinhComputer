const express = require('express');
const cors = require('cors');

require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// Kết nối Database
connectDB();

// Import routes
const apiRouter = require('./routes/api.router');
app.use('/api', apiRouter);

// Route kiểm tra server
app.get('/', (req, res) => {
    res.send(`Server is running on http://localhost:${process.env.PORT}`);
});

module.exports = app;
