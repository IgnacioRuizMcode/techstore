const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 8, select: false },
  displayName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['cliente', 'admin', 'superadmin'], default: 'cliente' },
  photoUrl: String,
  phone: { type: String, trim: true, default: '' },
  address: {
    street: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    state: { type: String, trim: true, default: '' },
    zip: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: '' },
  },
  active: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  refreshTokens: [String],
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.verificationToken;
  delete obj.verificationTokenExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);