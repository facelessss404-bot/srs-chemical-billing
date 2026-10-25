const { setSequence, saveSetting } = require('./db');

function seedDatabase() {
  console.log('Initializing SBR Chemicals & Oils GST Billing Suite configuration...');

  // Company Profile Setting (Pre-configured for SBR Chemicals & Oils)
  const companyProfile = {
    company_name: 'S.B.R. CHEMICALS & OILS',
    tagline: 'Wholesale and Retail Supplier for all types of Industrial Chemicals & Automobile Lubricants Oils',
    address: 'No.210 D, Opp. Lisieux College, Sathy Main Road, Saravanampatti',
    city_town: 'Coimbatore',
    postal_code: '641035',
    state: 'Tamil Nadu',
    state_code: '33',
    phones: '9355151444, 8003342429',
    email: 'sbrchemicals@gmail.com',
    gstin: '33BWXPS5830B1Z2',
    bank_name: 'Canara Bank',
    account_no: '6038281090014',
    ifsc_code: 'CNRB0006038',
    branch: 'Saravanampatti',
    invoice_prefix: '',
    starting_invoice_no: 75,
    terms: '1. Goods once sold will not be taken back or exchanged.\n2. Interest @ 18% p.a. will be charged if payment is delayed beyond due date.\n3. Subject to Coimbatore Jurisdiction.'
  };

  saveSetting('company_profile', companyProfile);

  // Set sequence to 75 as requested
  setSequence('invoice_no', 75);

  console.log('Clean database initialization completed! (0 dummy records, fresh for client handover)');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
