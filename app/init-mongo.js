db = db.getSiblingDB('layhey');

db.createUser({
  user: 'layheyapp',
  pwd: 'l@yh3y@dm!n',
  roles: [{ role: 'readWrite', db: 'layhey' }],
});

db.grantRolesToUser('layheyapp', [{ role: 'readWrite', db: 'layhey' }]);

db.createCollection('transactions');
