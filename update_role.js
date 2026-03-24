import mysql from 'mysql2/promise';

async function run() {
  const pool = mysql.createPool('mysql://root:root@localhost:8889/quikqr');
  await pool.query("UPDATE users SET role = 'admin' WHERE email = 'muvx.lc@outlook.com'");
  console.log('Updated role to admin!');
  process.exit(0);
}

run();
