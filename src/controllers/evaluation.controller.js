const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RATING_FIELDS = [
  'punctuality',
  'technicalSkills',
  'communication',
  'teamwork',
  'initiative',
  'professionalism',
];

const validateRatings = (data) => {
  const errors = [];
  RATING_FIELDS.forEach((field) => {
    const value = data[field];
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      errors.push(`${field} must be an integer between 1 and 5`);
    }
  });
  const overall = data.overallRating;
  if (!Number.isInteger(overall) || overall < 1 || overall > 5) {
    errors.push('overallRating must be an integer between 1 and 5');
  }
  return errors;
};

// Supervisor creates/updates an evaluation for a student's application
const submitEvaluation = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const supervisorId = req.session.user.id;

    const {
      punctuality,
      technicalSkills,
      communication,
      teamwork,
      initiative,
      professionalism,
      overallRating,
      strengths,
      areasForImprovement,
      additionalComments,
    } = req.body;

    const errors = validateRatings(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Must be assigned as supervisor to this job
    const supervision = await prisma.supervision.findFirst({
      where: { supervisorId, jobId: application.jobId },
    });
    if (!supervision) {
      return res.status(403).json({ message: 'Not authorized to evaluate this student' });
    }

    const data = {
      supervisorId,
      punctuality,
      technicalSkills,
      communication,
      teamwork,
      initiative,
      professionalism,
      overallRating,
      strengths: strengths || null,
      areasForImprovement: areasForImprovement || null,
      additionalComments: additionalComments || null,
    };

    const evaluation = await prisma.evaluation.upsert({
      where: { applicationId },
      update: data,
      create: { applicationId, ...data },
    });

    res.json({ message: 'Evaluation saved', evaluation });
  } catch (error) {
    console.error('Submit evaluation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get evaluation for a specific application (student, employer owner, admin, supervisor)
const getEvaluation = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const user = req.session.user;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Authorization: student owner, employer owner of job, assigned supervisor, admin
    let allowed = false;
    if (user.role === 'ADMIN') allowed = true;
    if (user.role === 'STUDENT' && application.studentId === user.id) allowed = true;
    if (user.role === 'EMPLOYER' && application.job.employerId === user.id) allowed = true;
    if (user.role === 'SUPERVISOR') {
      const supervision = await prisma.supervision.findFirst({
        where: { supervisorId: user.id, jobId: application.jobId },
      });
      if (supervision) allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const evaluation = await prisma.evaluation.findUnique({
      where: { applicationId },
      include: {
        supervisor: { include: { supervisorProfile: true } },
      },
    });

    res.json(evaluation || null);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all evaluations created by the logged-in supervisor
const getMyEvaluations = async (req, res) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: { supervisorId: req.session.user.id },
      include: {
        application: {
          include: {
            student: { include: { studentProfile: true } },
            job: { include: { employer: { include: { employerProfile: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(evaluations);
  } catch (error) {
    console.error('Get my evaluations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  submitEvaluation,
  getEvaluation,
  getMyEvaluations,
};