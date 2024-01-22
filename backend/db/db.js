const pgp = require("pg-promise")();

let db = null;

exports.getDb = () => {
  const cs = `${process.env.DB_PROTOCOL}://${process.env.DB_USER}@${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_SCHEMA}`;
  if (!db) {
    db = pgp(cs);
  }
  return db;
};
