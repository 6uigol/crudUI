module.exports = {
  server: '127.0.0.1',
  database: 'crud',
  user: 'garry',
  password: '1994',
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};
