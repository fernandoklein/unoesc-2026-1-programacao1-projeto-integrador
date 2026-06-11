const runMigrations = require('./migrate');

runMigrations().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
