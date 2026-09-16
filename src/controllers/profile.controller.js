const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get logged-in student's profile
const getStudentProfile = async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: req.session.user.id },
      include: { user: { select: { email: true } } },
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update logged-in student's profile
const updateStudentProfile = async (req, res) => {
  try {
    let { fullName, bio, skills } = req.body;

    if (typeof skills === 'string') {
      try {
        skills = JSON.parse(skills);
      } catch {
        return res.status(400).json({ message: 'Skills must be a valid JSON array' });
      }
    }

    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (bio !== undefined) data.bio = bio;
    if (skills !== undefined) data.skills = skills;

    if (req.file) {
      data.resumeUrl = `/uploads/resumes/${req.file.filename}`;
    }

    // Determine if profile is complete
    const current = await prisma.studentProfile.findUnique({
      where: { userId: req.session.user.id },
    });
    const merged = { ...current, ...data };
    data.profileComplete = Boolean(
      merged.fullName &&
      merged.bio &&
      merged.skills &&
      merged.skills.length > 0
    );

    const updated = await prisma.studentProfile.update({
      where: { userId: req.session.user.id },
      data,
    });

    res.json({ message: 'Profile updated', profile: updated });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get logged-in employer's profile
const getEmployerProfile = async (req, res) => {
  try {
    const profile = await prisma.employerProfile.findUnique({
      where: { userId: req.session.user.id },
      include: { user: { select: { email: true } } },
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Get employer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update logged-in employer's profile
const updateEmployerProfile = async (req, res) => {
  try {
    const { companyName, website, description } = req.body;

    const data = {};
    if (companyName !== undefined) data.companyName = companyName;
    if (website !== undefined) data.website = website;
    if (description !== undefined) data.description = description;

    if (req.file) {
      data.logoUrl = `/uploads/logos/${req.file.filename}`;
    }

    const current = await prisma.employerProfile.findUnique({
      where: { userId: req.session.user.id },
    });
    const merged = { ...current, ...data };
    data.profileComplete = Boolean(
      merged.companyName && merged.description
    );

    const updated = await prisma.employerProfile.update({
      where: { userId: req.session.user.id },
      data,
    });

    res.json({ message: 'Profile updated', profile: updated });
  } catch (error) {
    console.error('Update employer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudentProfile,
  updateStudentProfile,
  getEmployerProfile,
  updateEmployerProfile,
};