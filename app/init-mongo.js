const username = process.env.LAYHEY_DB_USERNAME;
const password = process.env.LAYHEY_DB_PASSWORD;

db = db.getSiblingDB('layhey');

db.createUser({
  user: username,
  pwd: password,
  roles: [{ role: 'readWrite', db: 'layhey' }],
});

db.createCollection('transactionCategories');
db.createCollection('transactions');
db.createCollection('accountingPeriods');
