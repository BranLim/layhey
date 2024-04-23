db = db.getSiblingDB('layhey');

db.createUser({
  user: 'layheyapp',
  pwd: 'l4yh3yadm1n',
  roles: [{ role: 'readWrite', db: 'layhey' }],
});

db.createCollection('transactions');
