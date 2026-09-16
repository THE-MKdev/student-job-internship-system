const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [users, students, employers, supervisors, admins, jobs, applications, supervisions] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'EMPLOYER' } }),
        prisma.user.count({ where: { role: 'SUPERVISOR' } }),
        prisma.user.count({ where: { role: 'ADMIN' } }),
        prisma.job.count(),
        prisma.application.count(),
        prisma.supervision.count(),
      ]);

    res.json({
      users: { total: users, students, employers, supervisors, admins },
      jobs,
      applications,
      supervisions,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (optionally filter by role)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        studentProfile: { select: { fullName: true } },
        employerProfile: { select: { companyName: true } },
        supervisorProfile: { select: { fullName: true, department: true } },
        adminProfile: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.session.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all jobs (including inactive)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        employer: { include: { employerProfile: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(jobs);
  } catch (error) {
    console.error('Get all jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle job active status
const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const updated = await prisma.job.update({
      where: { id },
      data: { isActive: !job.isActive },
    });

    res.json({ message: 'Job status updated', job: updated });
  } catch (error) {
    console.error('Toggle job status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a job
const deleteJobAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all applications
const getAllApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        job: { select: { title: true, employer: { include: { employerProfile: true } } } },
        student: { include: { studentProfile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign a supervisor to a job
const assignSupervisor = async (req, res) => {
  try {
    const { supervisorId, jobId, notes } = req.body;

    if (!supervisorId || !jobId) {
      return res.status(400).json({ message: 'Supervisor ID and Job ID are required' });
    }

    const supervisor = await prisma.user.findUnique({ where: { id: supervisorId } });
    if (!supervisor || supervisor.role !== 'SUPERVISOR') {
      return res.status(400).json({ message: 'Invalid supervisor' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const supervision = await prisma.supervision.create({
      data: {
        supervisorId,
        jobId,
        notes: notes || null,
      },
    });

    res.status(201).json({ message: 'Supervisor assigned', supervision });
  } catch (error) {
    console.error('Assign supervisor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all supervisions
const getAllSupervisions = async (req, res) => {
  try {
    const supervisions = await prisma.supervision.findMany({
      include: {
        supervisor: { include: { supervisorProfile: true } },
        job: { include: { employer: { include: { employerProfile: true } } } },
      },
      orderBy: { assignedAt: 'desc' },
    });

    res.json(supervisions);
  } catch (error) {
    console.error('Get all supervisions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove a supervision
const removeSupervision = async (req, res) => {
  try {
    const { id } = req.params;

    const supervision = await prisma.supervision.findUnique({ where: { id } });
    if (!supervision) {
      return res.status(404).json({ message: 'Supervision not found' });
    }

    await prisma.supervision.delete({ where: { id } });

    res.json({ message: 'Supervision removed' });
  } catch (error) {
    console.error('Remove supervision error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllJobs,
  toggleJobStatus,
  deleteJobAdmin,
  getAllApplications,
  assignSupervisor,
  getAllSupervisions,
  removeSupervision,
};