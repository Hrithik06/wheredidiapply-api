import {
  Prisma,
  JobStatus,
  JobSource,
  Job,
} from "../generated/prisma/client.js";

// ===== DB TYPES =====
// Used ONLY when talking to Prisma (internal use)
// Allows direct DB fields like userId
export type CreateJobDBInput = Prisma.JobUncheckedCreateInput;
export type UpdateJobDBInput = Prisma.JobUncheckedUpdateInput;
export type JobWhereInput = Prisma.JobWhereInput;

// ===== API TYPES =====
// Represents what client is ALLOWED to send
// NEVER include userId here (comes from JWT)
export type CreateJobInput = {
  company: string;
  title: string;
  appliedAt: string;
  status?: JobStatus;
  notes?: string;
  url?: string;
};

// Partial update → all optional
// Only allow safe fields (no userId, no system fields)
export type UpdateJobInput = {
  company?: string;
  title?: string;
  status?: JobStatus;
  notes?: string;
  url?: string;
  appliedAt?: string;
};

// ===== SERVICE TYPES service layer=====
// Combines client data + server-controlled fields
// userId is injected from req.user (trusted)
export type CreateJobServiceInput = CreateJobInput & {
  userId: string;
};

// ===== RE-EXPORTS =====
// Keep Prisma as source of truth for enums
export { JobStatus, JobSource };

// Represents DB row (used in responses)
export type { Job };
