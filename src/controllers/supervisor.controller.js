const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get supervisor's profile
const getSupervisorProfile = async (req, res) => {
  try {
    const profile = await prisma.supervisorProfile.findUnique({
      where: { userId: req.session.user.id },
      include: { user: { select: { email: true } } },
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    console.error('Get supervisor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update supervisor's profile
const updateSupervisorProfile = async (req, res) => {
  try {
    const { fullName, department } = req.body;

    const data = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (department !== undefined) data.department = department;

    const updated = await prisma.supervisorProfile.update({
      where: { userId: req.session.user.id },
      data,
    });

    res.json({ message: 'Profile updated', profile: updated });
  } catch (error) {
    console.error('Update supervisor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all supervisions assigned to the logged-in supervisor
const getMySupervisions = async (req, res) => {
  try {
    const supervisions = await prisma.supervision.findMany({
      where: { supervisorId: req.session.user.id },
      include: {
        job: {
          include: {
            employer: { include: { employerProfile: true } },
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    res.json(supervisions);
  } catch (error) {
    console.error('Get supervisions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get details for a specific supervision
const getSupervisionById = async (req, res) => {
  try {
    const supervision = await prisma.supervision.findUnique({
      where: { id: req.params.id },
      include: {
        job: {
          include: {
            employer: { include: { employerProfile: true } },
            applications: {
              include: {
                student: { include: { studentProfile: true } },
              },
            },
          },
        },
      },
    });

    if (!supervision) {
      return res.status(404).json({ message: 'Supervision not found' });
    }
    if (supervision.supervisorId !== req.session.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(supervision);
  } catch (error) {
    console.error('Get supervision error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update supervision notes
const updateSupervisionNotes = async (req, res) => {
  try {
    const { notes } = req.body;

    const supervision = await prisma.supervision.findUnique({
      where: { id: req.params.id },
    });
    if (!supervision) {
      return res.status(404).json({ message: 'Supervision not found' });
    }
    if (supervision.supervisorId !== req.session.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.supervision.update({
      where: { id: req.params.id },
      data: { notes },
    });

    res.json({ message: 'Notes updated', supervision: updated });
  } catch (error) {
    console.error('Update supervision notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSupervisorProfile,
  updateSupervisorProfile,
  getMySupervisions,
  getSupervisionById,
  updateSupervisionNotes,
};