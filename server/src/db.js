const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'billing.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS parties (
      id TEXT PRIMARY KEY,
      party_name TEXT NOT NULL,
      party_code TEXT,
      party_group TEXT,
      address TEXT,
      city_town TEXT,
      postal_code TEXT,
      phone TEXT,
      email TEXT,
      gstin TEXT,
      is_interstate INTEGER DEFAULT 0,
      data TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_parties_name ON parties(party_name);
    CREATE INDEX IF NOT EXISTS idx_parties_gstin ON parties(gstin);

    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      item_code TEXT,
      uom TEXT,
      selling_price REAL DEFAULT 0,
      gst_applicable INTEGER DEFAULT 1,
      gst_name TEXT,
      gst_rate REAL DEFAULT 18,
      hsn_sac_code TEXT,
      data TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_items_name ON items(item_name);
    CREATE INDEX IF NOT EXISTS idx_items_code ON items(item_code);

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_no TEXT UNIQUE,
      invoice_date TEXT,
      party_id TEXT,
      party_name TEXT,
      grand_total REAL DEFAULT 0,
      net_total REAL DEFAULT 0,
      status TEXT DEFAULT 'Unpaid',
      data TEXT NOT NULL,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_no ON invoices(invoice_no);
    CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
    CREATE INDEX IF NOT EXISTS idx_invoices_party ON invoices(party_id);

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sequences (
      name TEXT PRIMARY KEY,
      current_value INTEGER NOT NULL
    );
  `);
}

initSchema();

// Generic Repository
function getRepository(tableName) {
  return {
    getAll: () => {
      const stmt = db.prepare(`SELECT * FROM ${tableName} ORDER BY updated_at DESC, created_at DESC`);
      const rows = stmt.all();
      return rows.map(r => {
        try {
          return JSON.parse(r.data);
        } catch (e) {
          return r;
        }
      });
    },

    getById: (id) => {
      const stmt = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`);
      const row = stmt.get(id);
      if (!row) return null;
      try {
        return JSON.parse(row.data);
      } catch (e) {
        return row;
      }
    },

    save: (record) => {
      if (!record.id) {
        record.id = tableName + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      }
      const now = new Date().toISOString();
      if (!record.created_at) record.created_at = now;
      record.updated_at = now;

      const dataStr = JSON.stringify(record);

      if (tableName === 'parties') {
        const stmt = db.prepare(`
          INSERT INTO parties (id, party_name, party_code, party_group, address, city_town, postal_code, phone, email, gstin, is_interstate, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            party_name=excluded.party_name,
            party_code=excluded.party_code,
            party_group=excluded.party_group,
            address=excluded.address,
            city_town=excluded.city_town,
            postal_code=excluded.postal_code,
            phone=excluded.phone,
            email=excluded.email,
            gstin=excluded.gstin,
            is_interstate=excluded.is_interstate,
            data=excluded.data,
            updated_at=excluded.updated_at
        `);
        stmt.run(
          record.id,
          record.party_name || '',
          record.party_code || '',
          record.party_group || 'Customers',
          record.address || '',
          record.city_town || '',
          record.postal_code || '',
          record.phone || '',
          record.email || '',
          record.gstin || '',
          record.is_interstate ? 1 : 0,
          dataStr,
          record.created_at,
          record.updated_at
        );
      } else if (tableName === 'items') {
        const stmt = db.prepare(`
          INSERT INTO items (id, item_name, item_code, uom, selling_price, gst_applicable, gst_name, gst_rate, hsn_sac_code, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            item_name=excluded.item_name,
            item_code=excluded.item_code,
            uom=excluded.uom,
            selling_price=excluded.selling_price,
            gst_applicable=excluded.gst_applicable,
            gst_name=excluded.gst_name,
            gst_rate=excluded.gst_rate,
            hsn_sac_code=excluded.hsn_sac_code,
            data=excluded.data,
            updated_at=excluded.updated_at
        `);
        stmt.run(
          record.id,
          record.item_name || '',
          record.item_code || '',
          record.uom || 'Nos',
          Number(record.selling_price) || 0,
          record.gst_applicable === false ? 0 : 1,
          record.gst_name || 'GST 18%',
          Number(record.gst_rate) || 18,
          record.hsn_sac_code || '',
          dataStr,
          record.created_at,
          record.updated_at
        );
      } else if (tableName === 'invoices') {
        const stmt = db.prepare(`
          INSERT INTO invoices (id, invoice_no, invoice_date, party_id, party_name, grand_total, net_total, status, data, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            invoice_no=excluded.invoice_no,
            invoice_date=excluded.invoice_date,
            party_id=excluded.party_id,
            party_name=excluded.party_name,
            grand_total=excluded.grand_total,
            net_total=excluded.net_total,
            status=excluded.status,
            data=excluded.data,
            updated_at=excluded.updated_at
        `);
        stmt.run(
          record.id,
          String(record.invoice_no || ''),
          record.invoice_date || '',
          record.party_id || '',
          record.party_name || '',
          Number(record.grand_total || record.sub_total || 0),
          Number(record.net_total || 0),
          record.status || 'Paid',
          dataStr,
          record.created_at,
          record.updated_at
        );
      } else {
        // generic
        const stmt = db.prepare(`
          INSERT INTO ${tableName} (id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET data=excluded.data, updated_at=excluded.updated_at
        `);
        stmt.run(record.id, dataStr, record.created_at, record.updated_at);
      }

      return record;
    },

    delete: (id) => {
      const stmt = db.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
      stmt.run(id);
      return { success: true };
    }
  };
}

// Sequence generator
function getNextSequence(name, startFrom = 1) {
  const selectStmt = db.prepare('SELECT current_value FROM sequences WHERE name = ?');
  const row = selectStmt.get(name);
  let nextVal;
  if (!row) {
    nextVal = startFrom;
    const insertStmt = db.prepare('INSERT INTO sequences (name, current_value) VALUES (?, ?)');
    insertStmt.run(name, nextVal);
  } else {
    nextVal = row.current_value + 1;
    const updateStmt = db.prepare('UPDATE sequences SET current_value = ? WHERE name = ?');
    updateStmt.run(nextVal, name);
  }
  return nextVal;
}

function setSequence(name, value) {
  const stmt = db.prepare(`
    INSERT INTO sequences (name, current_value) VALUES (?, ?)
    ON CONFLICT(name) DO UPDATE SET current_value = excluded.current_value
  `);
  stmt.run(name, Number(value));
  return value;
}

// Settings store
function getSettings() {
  const stmt = db.prepare('SELECT * FROM settings');
  const rows = stmt.all();
  const settingsObj = {};
  rows.forEach(r => {
    try {
      settingsObj[r.key] = JSON.parse(r.value);
    } catch (e) {
      settingsObj[r.key] = r.value;
    }
  });
  return settingsObj;
}

function saveSetting(key, val) {
  const now = new Date().toISOString();
  const valStr = JSON.stringify(val);
  const stmt = db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `);
  stmt.run(key, valStr, now);
}

module.exports = {
  db,
  dbPath,
  getRepository,
  getNextSequence,
  setSequence,
  getSettings,
  saveSetting
};
