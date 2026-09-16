const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Student applies to a job
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const studentId = req.session.user.id;
    const { coverLetter } = req.body;

    // Check job exists and is active
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.isActive) {
      return res.status(404).json({ message: 'Job not found or inactive' });
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_studentId: { jobId, studentId },
      },
    });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this job' });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        studentId,
        coverLetter: coverLetter || null,
        status: 'pending',
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Student views their own applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      where: { studentId: req.session.user.id },
      include: {
        job: {
          include: {
            employer: { include: { employerProfile: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Employer views applications for a specific job
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    if (job.employerId !== req.session.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        student: {
          include: { studentProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Employer updates application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'reviewed', 'shortlisted', 'accepted', 'rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    if (application.job.employerId !== req.session.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });

    res.json({
      message: 'Application status updated',
      application: updated,
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};