const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const {
  getRepository,
  getNextSequence,
  setSequence,
  getSettings,
  saveSetting
} = require('./db');
const { seedDatabase } = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initial seed if first time run
try {
  seedDatabase();
} catch (e) {
  console.error('Seed notice:', e.message);
}

// Entities
const ENTITIES = ['parties', 'items', 'invoices'];

ENTITIES.forEach(entity => {
  const repo = getRepository(entity);

  // List all
  app.get(`/api/${entity}`, (req, res) => {
    try {
      const records = repo.getAll();
      res.json(records);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get one
  app.get(`/api/${entity}/:id`, (req, res) => {
    try {
      const record = repo.getById(req.params.id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
      res.json(record);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Save / Update
  app.post(`/api/${entity}`, (req, res) => {
    try {
      const saved = repo.save(req.body);
      res.json(saved);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Batch Save
  app.post(`/api/${entity}/batch`, (req, res) => {
    try {
      const list = Array.isArray(req.body) ? req.body : [];
      list.forEach(item => repo.save(item));
      res.json({ success: true, count: list.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete
  app.delete(`/api/${entity}/:id`, (req, res) => {
    try {
      repo.delete(req.params.id);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
});

// Settings API
app.get('/api/settings', (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/:key', (req, res) => {
  try {
    saveSetting(req.params.key, req.body);
    res.json({ success: true, key: req.params.key, value: req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Next Sequence Number
app.get('/api/sequence/:name', (req, res) => {
  try {
    const startFrom = Number(req.query.start) || 1;
    const nextVal = getNextSequence(req.params.name, startFrom);
    res.json({ sequence: nextVal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set Sequence Number
app.post('/api/sequence/:name', (req, res) => {
  try {
    const { value } = req.body;
    setSequence(req.params.name, value);
    res.json({ success: true, name: req.params.name, value });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full Backup Export
app.get('/api/backup/export', (req, res) => {
  try {
    const backup = {
      export_date: new Date().toISOString(),
      company: 'S.B.R. CHEMICALS & OILS',
      settings: getSettings(),
      parties: getRepository('parties').getAll(),
      items: getRepository('items').getAll(),
      invoices: getRepository('invoices').getAll()
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sbr_chemicals_billing_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Full Restore / Import
app.post('/api/backup/import', (req, res) => {
  try {
    const { settings, parties, items, invoices } = req.body;
    if (settings && typeof settings === 'object') {
      Object.entries(settings).forEach(([k, v]) => saveSetting(k, v));
    }
    if (Array.isArray(parties)) {
      const pRepo = getRepository('parties');
      parties.forEach(p => pRepo.save(p));
    }
    if (Array.isArray(items)) {
      const iRepo = getRepository('items');
      items.forEach(i => iRepo.save(i));
    }
    if (Array.isArray(invoices)) {
      const invRepo = getRepository('invoices');
      invoices.forEach(inv => invRepo.save(inv));
    }
    res.json({ success: true, message: 'Backup restored successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'S.B.R. CHEMICALS & OILS Billing Suite',
    time: new Date().toISOString()
  });
});

// Serve frontend build if exists
const distPath = path.join(__dirname, '../../app/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  S.B.R. CHEMICALS & OILS - GST BILLING SERVER`);
  console.log(`  Running on: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
