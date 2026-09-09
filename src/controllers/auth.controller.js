const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/password');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { email, password, role, fullName, companyName, department } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const allowedRoles = ['STUDENT', 'EMPLOYER', 'SUPERVISOR', 'ADMIN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          userId: user.id,
          fullName: fullName || '',
          skills: [],
          profileComplete: false,
        },
      });
    } else if (role === 'EMPLOYER') {
      await prisma.employerProfile.create({
        data: {
          userId: user.id,
          companyName: companyName || '',
          profileComplete: false,
        },
      });
    } else if (role === 'SUPERVISOR') {
      await prisma.supervisorProfile.create({
        data: {
          userId: user.id,
          fullName: fullName || '',
          department: department || '',
        },
      });
    } else if (role === 'ADMIN') {
      await prisma.adminProfile.create({
        data: {
          userId: user.id,
          fullName: fullName || '',
        },
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      message: 'Registration successful',
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json({ message: 'Logout successful' });
  });
};

const getCurrentUser = (req, res) => {
  if (req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.status(401).json({ message: 'Not authenticated' });
};

module.exports = { register, login, logout, getCurrentUser };