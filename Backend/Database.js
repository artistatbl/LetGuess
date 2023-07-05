const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");

const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open the database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");

    db.run(`CREATE TABLE IF NOT EXISTS users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      bio TEXT,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      password TEXT,
      salt TEXT,
      session_token TEXT,
      avatarUrl TEXT,
      created_at TEXT DEFAULT (date('now', 'localtime'))

    )`, (err) => {
      if (err) {
        console.log("Users table already created");
      } else {
        console.log("User table created");
      }

      const ADMIN_USERNAME = "whereisartist";
      const ADMIN_EMAIL = "admin@example.com";
      const ADMIN_BIO = "Follow me on tiktok and youtube at artistatbl";
      const ADMIN_PASSWORD = "Admin123!";

      const getHash = function (password, salt) {
        return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex');
      };

      const INSERT = 'INSERT INTO users (username, email, bio, level, experience, password, salt) VALUES (?,?,?,?,?,?,?)';
      const salt = crypto.randomBytes(64).toString('hex');
      const hash = getHash(ADMIN_PASSWORD, salt);

      db.run(INSERT, [ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_BIO, 1, 0, hash, salt], function (err) {
        if (err) {
          console.log("Admin user already exists");
        } else {
          console.log("Admin user created");
        }
      });
    });
  }
});

module.exports = db;
