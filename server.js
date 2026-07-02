const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const initDb = require('./backend/initDb');
const lawyerRoutes = require('./backend/routes/lawyer');
const superadminRoutes = require('./backend/routes/superadmin');
const firmadminRoutes = require('./backend/routes/firmadmin');
const staffRoutes = require('./backend/routes/staff');
const hrRoutes = require('./backend/routes/hr');
const clientRoutes = require('./backend/routes/client');
const corporateRoutes = require('./backend/routes/corporate');
const externalRoutes = require('./backend/routes/external');
const aiPremiumRoutes = require('./backend/routes/ai_premium');
const enterpriseRoutes = require('./backend/routes/enterprise');

const app = express();
const distPath = path.join(__dirname, 'dist');
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8081';

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eloyer-api' });
});

app.use('/api', lawyerRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/firmadmin', firmadminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/hr', hrRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/corporate', corporateRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/ai', aiPremiumRoutes);
app.use('/api/enterprise', enterpriseRoutes);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    return res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.redirect(302, `${frontendUrl}${req.originalUrl}`);
  });
}

const port = Number(process.env.PORT || 8080);

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Eloyer server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  });