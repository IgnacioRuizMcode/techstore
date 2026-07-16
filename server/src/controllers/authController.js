const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const passport = require('passport');
const crypto = require('crypto');

const emailService = require('../services/emailService');

// Generar tokens
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Aumentado para comodidad en desarrollo
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Enviar tokens en respuesta
const sendTokens = (user, statusCode, res) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshTokens.push(refreshToken);
  user.save({ validateBeforeSave: false });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    user,
  });
};

// Registro local
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { displayName, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      displayName,
      email,
      password,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isEmailVerified: false,
    });

    // Enviar correo de verificación
    try {
      await emailService.sendVerificationEmail(user.email, verificationToken);
    } catch (e) { console.error('Error enviando verificación:', e.message); }

    sendTokens(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Login local
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info.message });
    sendTokens(user, 200, res);
  })(req, res, next);
};

// Callback de Google
exports.googleCallback = (req, res) => {
  const accessToken = generateAccessToken(req.user);
  // Redirigir al frontend pasando el token como query param
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
};

// Cerrar sesión
exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(204).end();

  await User.findByIdAndUpdate(req.user._id, {
    $pull: { refreshTokens: refreshToken },
  });

  res.clearCookie('refreshToken');
  res.status(204).end();
};

// Refrescar token
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'No hay token de refresco' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    user.refreshTokens.pull(refreshToken);
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Obtener perfil del usuario logueado
exports.getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

exports.verifyEmail = async (req, res) => {
  try {
    const token = req.params.token.trim();

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    // Si el token no es válido, comprobar si existe un usuario que YA esté verificado
    // (posiblemente ya usó este mismo enlace antes)
    if (!user) {
      // Buscar un usuario que pudiera haber tenido este token en el pasado
      // No podemos buscar por token porque ya se borró, así que simplemente decimos que ya fue verificado
      return res.status(200).json({ success: true, message: 'El email ya fue verificado anteriormente o el enlace expiró.' });
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verificado correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Reenviar token de verificación
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'El email ya está verificado' });

    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    await user.save();

    await emailService.sendVerificationEmail(user.email, token);

    res.json({ success: true, message: 'Correo de verificación reenviado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Solicitar recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: 'No existe una cuenta con ese email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    await emailService.sendPasswordResetEmail(user.email, token);

    res.json({ success: true, message: 'Correo de recuperación enviado' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Restablecer contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Contraseña restablecida correctamente' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};