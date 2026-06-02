import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String },
  google_id: { type: String, unique: true, sparse: true },
  avatar: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  dietary_prefs: { type: mongoose.Schema.Types.Mixed, default: {} },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const refreshTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now }
});

const passwordResetTokenSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

export const UserModel = {
  async findById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findOne({ _id: id, is_active: true }).lean();
    if (user) {
      user.id = user._id.toString();
      user.hasPassword = !!user.password_hash;
    }
    return user;
  },

  async findByIdWithPassword(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const user = await User.findOne({ _id: id, is_active: true }).select('email password_hash is_active').lean();
    if (user) user.id = user._id.toString();
    return user;
  },

  async findByEmail(email) {
    const user = await User.findOne({ email }).lean();
    if (user) user.id = user._id.toString();
    return user;
  },

  async findByPhone(phone) {
    // Basic search, can be improved with regex
    const user = await User.findOne({ 
      $or: [
        { phone: phone },
        { phone: new RegExp(`${phone.slice(-9)}$`) }
      ]
    }).lean();
    if (user) user.id = user._id.toString();
    return user;
  },

  async findByGoogleId(googleId) {
    const user = await User.findOne({ google_id: googleId }).lean();
    if (user) user.id = user._id.toString();
    return user;
  },

  async create({ name, email, passwordHash = null, googleId = null, avatar = null, phone = null }) {
    const user = new User({
      name,
      email,
      password_hash: passwordHash,
      google_id: googleId,
      avatar,
      phone
    });
    await user.save();
    const result = user.toObject();
    result.id = result._id.toString();
    result.hasPassword = !!result.password_hash;
    return result;
  },

  async updateDietaryPrefs(userId, prefs) {
    const user = await User.findByIdAndUpdate(userId, { dietary_prefs: prefs }, { new: true }).lean();
    if (user) {
      user.id = user._id.toString();
      user.hasPassword = !!user.password_hash;
    }
    return user;
  },

  async updateProfile(userId, { name, email, avatar, phone, passwordHash }) {
    const update = { name, email, avatar: avatar || null, phone: phone || null };
    if (passwordHash) update.password_hash = passwordHash;
    
    const user = await User.findByIdAndUpdate(userId, update, { new: true }).lean();
    if (user) {
      user.id = user._id.toString();
      user.hasPassword = !!user.password_hash;
    }
    return user;
  },

  async updatePassword(userId, passwordHash) {
    await User.findByIdAndUpdate(userId, { password_hash: passwordHash });
  },

  async saveRefreshToken(userId, token, expiresAt) {
    await RefreshToken.create({ user_id: userId, token, expires_at: expiresAt });
  },

  async findRefreshToken(token) {
    const rt = await RefreshToken.findOne({ token, expires_at: { $gt: new Date() } }).populate('user_id').lean();
    if (!rt) return null;
    return {
      ...rt,
      role: rt.user_id.role,
      user_id: rt.user_id._id.toString()
    };
  },

  async deleteRefreshToken(token) {
    await RefreshToken.deleteOne({ token });
  },

  async findByGoogleIdOrEmail(googleId, email) {
    const user = await User.findOne({ 
      $or: [{ google_id: googleId }, { email: email }] 
    }).lean();
    if (user) user.id = user._id.toString();
    return user;
  },

  async updateGoogleInfo(userId, googleId, avatar) {
    await User.findByIdAndUpdate(userId, { google_id: googleId, avatar: avatar });
  },

  async delete(userId) {
    const result = await User.deleteOne({ _id: userId });
    return result.deletedCount > 0;
  },

  // Admin
  async findAll({ page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    const users = await User.find().sort({ created_at: -1 }).skip(skip).limit(limit).lean();
    const total = await User.countDocuments();
    
    users.forEach(u => u.id = u._id.toString());
    
    return { users, total, page, limit };
  },

  async updateRole(userId, role) {
    await User.findByIdAndUpdate(userId, { role });
  },

  async toggleActive(userId, isActive) {
    await User.findByIdAndUpdate(userId, { is_active: isActive });
  },

  // Password Resets
  async saveResetToken(userId, token, expiresAt) {
    await PasswordResetToken.create({ user_id: userId, token, expires_at: expiresAt });
  },

  async deleteResetTokensByUser(userId) {
    await PasswordResetToken.deleteMany({ user_id: userId });
  },

  async findResetToken(token) {
    const rt = await PasswordResetToken.findOne({ token }).populate('user_id').lean();
    if (!rt) return null;
    
    const now = new Date();
    if (rt.expires_at < now) return null;
    
    return {
      ...rt,
      email: rt.user_id.email,
      user_id: rt.user_id._id.toString()
    };
  },

  async deleteResetToken(token) {
    await PasswordResetToken.deleteOne({ token });
  },
};
