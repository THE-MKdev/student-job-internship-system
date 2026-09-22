const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

//create a new job(employer only)
const createJob = async(req, res) => {
    try {
        const { title, description, type, location, salary, skills } = req.body;

        if (!title || !description || !type) {
            return res.status(400).json({ message: 'Title, description, and type are required'});
        }

        const job = await prisma.job.create({
            data: {
                employerId: req.session.user.id,
                title,
                description,
                type,
                location: location || null,
                salary: salary || null,
                skills : skills || [],
            },
            include: {
                employer: {
                    include: {
                        employerProfile: true,
                    }
                }
            }
        });

        res.status(201).json(job);
    } catch (error) {
        console.error('Create job error',error);
        res.status(500).json({ message: 'Server error'});
    }
};

//get all jobs (public) with optional filters
const getJobs = async(req, res) => {
    try {
        const { search, type, location } = req.query;

        const where = { isActive: true };

        if (type) where.type = type;
        if (location) where.location = { contains: location, mode: 'insentive' };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'incentive'} },
                { description: { contains: search, mode: 'incentive'} },
            ];
        }

        const jobs = await prisma.job.findMany({
            where,
            include: {
                employer: {
                    include: { employerProfile: true },
                },
            },
            orderBy: { createdAt: 'desc'},
        });

        res.json(jobs);
    } catch (error) {
        console.error('Get jobs error',error);
        res.status(500).json({ message: 'Server error'});
    }
};

//get a single job by id 
const getJobById = async (req, res) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: req.params.id },
            include: {
                employer: {
                    include: { employerProfile: true },
                },
            },
        });

        if (!job) {
            return res.status(404).json({ message: 'Job not found'});
        };

        res.json(job);
    } catch (error) {
        console.error('Get job error',error);
        res.status(500).json({ message: 'Server error'});
    }
};

//update a job (employer owner only)
const updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.session.user.id;

        const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
        if (!existingJob) {
            return res.status(404).json({ message: 'Job not found'});
        }
        if (existingJob.employerId !== userId) {
            return res.status(403).json({ message: 'Not authorized'});
        }

        const { title, description, type, location, salary, skills, isActive } = req.body;

        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data : {
                title : title ?? undefined,
                description: description ?? undefined,
                type: type ?? undefined,
                location : location ?? undefined,
                salary: salary ?? undefined,
                skills: skills ?? undefined,
                isActive: isActive ?? undefined,
            },
        });

        res.json(updatedJob);
    } catch (error) {
        console.error('Updated job error', error);
        res.status(500).json({ message: 'Server error'});
    }
};

//delete a job (employer owner only)
const deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const userId = req.session.user.id;

        const existingJob = await prisma.job.findUnique({ where: { id: jobId } });
        if (!existingJob) {
            return res.status(404).json({ message: 'Job not found' });
        }
        if (existingJob.employerId !== userId) {
            return res.status(403).json({ message: 'Not authorized'});
        }

        await prisma.job.delete({ where: { id: jobId } });

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Delete job error',error);
        res.status(500).json({ message: 'Server error' });
    }
};

//get jobs posted by the logged in employor
const getMyJobs = async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            where: { employerId: req.session.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs);
    } catch (error) {
        console.error('Get my jobs error',error);
        res.status(500).json({message: 'Server error' });
    }
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getMyJobs,
};