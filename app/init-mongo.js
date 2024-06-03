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

db.transactionCategories.insertMany([
  {
    name: 'Housing',
    description: 'Housing - Mortgage/Rental',
  },
  {
    name: 'Dining',
    description: 'Dining - Restaurant/Fast Food',
  },
  {
    name: 'Utility',
    description: 'Utilities - Power, Mobile, Broadband, etc',
  },
  {
    name: 'Tax',
    description: 'Tax - Income Tax, Vehicle Tax, Property Tax, etc.',
  },
  {
    name: 'Clothes',
    description: 'Clothes',
  },
  {
    name: 'Electronic/gadget',
    description: 'Electronic/gadget',
  },
  {
    name: 'Medical',
    description: 'Medical - Dental, GP, Hospital, Surgery, etc.',
  },
  {
    name: 'Insurance',
    description: 'Insurance',
  },
  {
    name: 'Grocery',
    description: 'Grocery - Fruits, Meats, Vegetables, Noodles, Rice, etc.',
  },
  {
    name: 'Hobby',
    description: 'Hobby',
  },
  {
    name: 'Entertainment',
    description: 'Entertainment - Movies, Games, Arcade',
  },
  {
    name: 'Salary',
    description: 'Salary',
  },
  {
    name: 'Government Assistance',
    description: 'Government Assistance',
  },
  {
    name: 'Dividend',
    description: 'Dividend',
  },
]);
