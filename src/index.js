require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('./config/session');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session);

app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Student Job Portal API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});