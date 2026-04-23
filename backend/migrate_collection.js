import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'recipe_finder',
});

const SQL = `
CREATE TABLE IF NOT EXISTS user_recipes (
    id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id          INT UNSIGNED  NOT NULL,
    title            VARCHAR(255)  NOT NULL,
    description      TEXT          NULL,
    image_url        VARCHAR(500)  NULL,
    ingredients      JSON          NOT NULL,
    instructions     JSON          NOT NULL,
    cuisine          VARCHAR(100)  NULL,
    cook_time_minutes INT UNSIGNED NULL,
    servings         INT UNSIGNED  NULL DEFAULT 2,
    is_public        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_public (is_public),
    FULLTEXT INDEX ft_title_desc (title, description)
) ENGINE=InnoDB;
`;

try {
  await pool.query(SQL);
  console.log('✅ user_recipes table created successfully');
} catch (err) {
  console.error('❌ Migration failed:', err.message);
} finally {
  await pool.end();
}
