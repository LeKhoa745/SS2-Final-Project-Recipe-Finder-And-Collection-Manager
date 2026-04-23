import pool from '../config/db.js';

export const UserModel = {
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, avatar, phone, role, dietary_prefs, created_at, (password_hash IS NOT NULL) as hasPassword FROM users WHERE id = ? AND is_active = 1',
      [id]
    );
    if (rows[0]) {
      rows[0].hasPassword = !!rows[0].hasPassword;
    }
    return rows[0] || null;
  },

  async findByIdWithPassword(id) {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, is_active FROM users WHERE id = ? AND is_active = 1',
      [id]
    );
    return rows[0] || null;
  },

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findByPhone(phone) {
    // Search with exact or normalized suffix match if needed, here we use LIKE for flexibilty with +84
    const [rows] = await pool.query('SELECT * FROM users WHERE phone = ? OR phone LIKE ?', [phone, `%${phone.slice(-9)}`]);
    return rows[0] || null;
  },

  async findByGoogleId(googleId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
    return rows[0] || null;
  },

  async create({ name, email, passwordHash = null, googleId = null, avatar = null, phone = null }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, google_id, avatar, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, passwordHash, googleId, avatar, phone]
    );
    return this.findById(result.insertId);
  },

  async updateDietaryPrefs(userId, prefs) {
    await pool.query(
      'UPDATE users SET dietary_prefs = ? WHERE id = ?',
      [JSON.stringify(prefs), userId]
    );
    return this.findById(userId);
  },

  async updateProfile(userId, { name, email, avatar, phone }) {
    await pool.query(
      'UPDATE users SET name = ?, email = ?, avatar = ?, phone = ? WHERE id = ?',
      [name, email, avatar || null, phone || null, userId]
    );
    return this.findById(userId);
  },

  async updatePassword(userId, passwordHash) {
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, userId]
    );
  },

  async saveRefreshToken(userId, token, expiresAt) {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  },

  async findRefreshToken(token) {
    const [rows] = await pool.query(
      'SELECT rt.*, u.role FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token = ? AND rt.expires_at > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  async deleteRefreshToken(token) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = ?', [token]);
  },

  // Admin
  async findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    const [rows]  = await pool.query(
      'SELECT id, name, email, avatar, phone, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users');
    return { users: rows, total, page, limit };
  },

  async updateRole(userId, role) {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
  },

  async toggleActive(userId, isActive) {
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
  },

  // Password Resets
  async saveResetToken(userId, token, expiresAt) {
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
  },

  async findResetToken(token) {
    console.log('--- DEBUG: Finding reset token:', token);
    const [rows] = await pool.query(
      'SELECT pt.*, u.email FROM password_reset_tokens pt JOIN users u ON u.id = pt.user_id WHERE pt.token = ?',
      [token]
    );
    
    if (!rows[0]) {
      console.log('--- DEBUG: Token not found in DB');
      return null;
    }
    
    const now = new Date();
    const expiresAt = new Date(rows[0].expires_at);
    
    console.log('--- DEBUG: Current time:', now.toISOString());
    console.log('--- DEBUG: Token expires at:', expiresAt.toISOString());
    
    if (expiresAt < now) {
      console.log('--- DEBUG: Token is expired');
      return null;
    }
    
    return rows[0];
  },

  async deleteResetToken(token) {
    await pool.query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);
  },
};
