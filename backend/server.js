const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const initDb = require('./initDb');
const lawyerRoutes = require('./routes/lawyer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eloyer-api-only' });
});

app.use('/api', lawyerRoutes);

const port = Number(process.env.API_PORT || 3000);

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Eloyer API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  });
