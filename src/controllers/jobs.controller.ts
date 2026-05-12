import { Response } from "express";
import {
  createJob,
  filterJobs,
  softDeleteJob,
  updateJob,
} from "../services/jobs.service.js";
import { prisma } from "../lib/prisma.js";
import { FilterJobQuery } from "../validators/job.validator.js";
import { JobStatus, JobSource } from "../types/jobs.js";
import { AuthRequest } from "../types/request.js";
type Params = {
  id: string;
};

// add new job
export const addJob = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;
  const input = req.body;
  const job = {
    ...input, // validated by Zod
    status: input.status ?? JobStatus.APPLIED, // apply defaults for missing fields
    appliedDate: new Date(input.appliedDate) ?? new Date(), // apply defaults for missing fields
    userId, // injected by server
  };
  const jobDB = await createJob(job);
  res.status(201).json(jobDB);
};
//edit job
// do not apply defaults, only update provided fields
export const editJob = async (req: AuthRequest<Params>, res: Response) => {
  const { id: jobId } = req.params;

  const input = req.body; // validated by Zod

  const updatedJob = await updateJob(jobId, input);
  res.json(updatedJob);
};

//soft delete
export const deleteJob = async (req: AuthRequest<Params>, res: Response) => {
  const { id: jobId } = req.params;
  const userId = req.user.userId;
  const deletedJob = await softDeleteJob(jobId, userId);
  res.json(deletedJob);
};

//filter jobs
export const getJobs = async (
  req: AuthRequest<{}, {}, {}, FilterJobQuery>,
  res: Response,
) => {
  const { company, status, source, q } = req.query;
  const userId = req.user.userId;
  const jobs = await filterJobs({
    userId,
    company,
    status,
    source,
    q,
  });

  res.json(jobs);
};

//seed dummy data
export const seedJobsForUser = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;

  const jobs = [
    {
      userId,
      company: "Google",
      title: "Frontend Engineer",
      status: JobStatus.APPLIED,
      source: JobSource.MANUAL,
      notes: "Applied via careers page",
    },
    {
      userId,
      company: "Microsoft",
      title: "Software Engineer",
      status: JobStatus.REJECTED,
      source: JobSource.MANUAL,
      notes: "Rejected after OA",
    },
    {
      userId,
      company: "Amazon",
      title: "SDE I",
      status: JobStatus.INTERVIEW_SCHEDULED,
      source: JobSource.GMAIL_AUTO,
      emailMessageId: `msg-${userId}-demo`,
      emailThreadId: `thread-${userId}-demo`,
      emailSubject: "Your application at Amazon",
    },
  ];

  await prisma.job.createMany({
    data: jobs,
    skipDuplicates: true, // 👈 important
  });

  res.status(201).json({ message: "Dummy jobs added" });
};
//delete all job data
export const deleteAllJobDataOfUser = async (
  req: AuthRequest,
  res: Response,
) => {
  const userId = req.user.userId;

  await prisma.job.deleteMany({ where: { userId } });
  res.json({ message: "All Jobs Data Deleted" });
};
