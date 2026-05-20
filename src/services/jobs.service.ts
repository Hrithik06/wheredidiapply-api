import { prisma } from "../lib/prisma.js";
import {
  CreateJobServiceInput,
  JobSource,
  JobStatus,
  JobWhereInput,
  UpdateJobInput,
} from "../types/jobs.js";
const getBaseWhere = (userId: string): JobWhereInput => ({
  userId,
  deletedAt: null, //ignore jobs which have value for deletedAt as they are soft deleted
});

export async function filterJobs(filter: {
  userId: string;
  company?: string;
  status?: JobStatus;
  source?: JobSource;
  q?: string;
}) {
  const where: JobWhereInput = {
    ...getBaseWhere(filter.userId),

    ...(filter.company && {
      company: { equals: filter.company, mode: "insensitive" },
    }),
    ...(filter.status && { status: filter.status }),
    ...(filter.source && { source: filter.source }),

    ...(filter.q && {
      OR: [
        { company: { contains: filter.q, mode: "insensitive" } },
        { title: { contains: filter.q, mode: "insensitive" } },
      ],
    }),
  };

  return prisma.job.findMany({ where });
  // return where;
}

//For Manual Entry
export async function createJob(data: CreateJobServiceInput) {
  return prisma.job.create({
    data, // matches UncheckedCreateInput
  });
}

export async function updateJob(jobId: string, data: UpdateJobInput) {
  const updatedJob = await prisma.job.update({ where: { id: jobId }, data });
  return updatedJob;
}

//For deleted
//why getBaseWhere here? cuz we dont want to let user soft delete the same job again which will cause update in deletedAt timestamp
export async function softDeleteJob(jobId: string, userId: string) {
  // updateMany returns count instead of throwing if no match (already deleted / not found)
  const result = await prisma.job.updateMany({
    where: {
      id: jobId,
      userId,
      deletedAt: null, // only delete if not already deleted
    },
    data: {
      deletedAt: new Date(),
    },
  });

  // nothing updated → already deleted OR not found
  if (result.count === 0) {
    return { alreadyDeleted: true };
  }

  return { success: true };
}

// //For GMail
// export async function findOrCreateJob(job: CreateJobServiceInput) {
//   if (job.emailMessageId) {
//     return prisma.job.upsert({
//       where: {
//         userId_emailMessageId: {
//           userId: job.userId,
//           emailMessageId: job.emailMessageId,
//         },
//       },
//       update: {}, // don't overwrite
//       create: job,
//     });
//   }

//   // manual job → just create
//   return prisma.job.create({
//     data: job,
//   });
// }
