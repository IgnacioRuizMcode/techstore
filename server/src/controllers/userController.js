const User = require('../models/User');

// Obtener perfil del usuario autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Actualizar perfil del usuario autenticado
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['displayName', 'phone', 'address'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ─── Admin ─────────────────────────────────────

// Obtener todos los usuarios (con cantidad de pedidos)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders',
        },
      },
      {
        $addFields: {
          ordersCount: { $size: '$orders' },
        },
      },
      {
        $project: {
          refreshTokens: 0,
          password: 0,
          orders: 0,
        },
      },
    ]);
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Crear un nuevo usuario (admin)
exports.createUser = async (req, res) => {
  try {
    const { email, displayName, password, role } = req.body;
    if (!email || !displayName || !password) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }
    const user = await User.create({
      email,
      displayName,
      password,
      role: role || 'cliente',
      active: true,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Actualizar usuario (admin)
exports.updateUser = async (req, res) => {
  try {
    const updates = {};
    if (req.body.displayName) updates.displayName = req.body.displayName;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.role) updates.role = req.body.role;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Cambiar rol (endpoint específico)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Activar/desactivar usuario
exports.toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    user.active = !user.active;
    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};