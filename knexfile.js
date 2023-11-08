// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  production: {
    client: 'pg',
    connection: {
      host: "10.143.24.84",
      port: "6432",
      user: "root",
      database: "oidc",
      password: "hvxahv123",
      ssl: false,
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
