import { z } from "zod";
import { JobSource, JobStatus } from "../types/jobs.js";

export const createJobSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(JobStatus).optional(),
  notes: z.string().optional(),
  url: z.url().optional(),
  appliedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), //Mandatory when data is coming from client not auto gmail
});

export const updateJobSchema = z.object({
  company: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  status: z.enum(JobStatus).optional(),
  notes: z.string().optional(),
  url: z.url().optional(),
  appliedAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const filterJobSchema = z.object({
  company: z.string().min(1).optional(),
  status: z.enum(JobStatus).optional(),
  source: z.enum(JobSource).optional(),
  q: z.string().min(1).optional(), //search
});
export type FilterJobQuery = z.infer<typeof filterJobSchema>;
