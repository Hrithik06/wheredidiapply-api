
export const JOB_PLATFORM_SENDERS = [
    "linkedin.com",
    "indeed.com",
    "naukri.com",
    "wellfound.com",       // angel.co
    "greenhouse.io",
    "lever.co",
    "ashbyhq.com",
    "workday.com",
    "smartrecruiters.com",
    "jobvite.com",
    "icims.com",
    "bamboohr.com",
    "myworkdayjobs.com",
    "recruitee.com",
    "workablemail.com",
    "hire.lever.co",
    "boards.greenhouse.io",
    "app.greenhouse.io",
    "talent.icims.com",
    "jobs.lever.co"
]
export const EXACT_JOB_SENDERS = [
    "jobs-noreply@linkedin.com"
]
export const APPLICATION_CONFIRMATION = [
    "application received",
    "thank you for applying",
    "we received your application",
    "application confirmation",
    "thanks for applying",
    "application submitted",
    "your application for",
    "we have received your application",
    "your application has been received"
]
export const RECRUITER_OUTREACH = [
    "we came across your profile",
    "your background caught our attention",
    "we think you'd be a great fit",
    "interested in learning more about you",
    "exciting opportunity",
    "looking for a frontend engineer",
    "would love to connect",
    "let's schedule a call",
    "quick chat about opportunity",
    "open role"
]
export const INTERVIEW_INVITES = [
    "interview",
    "interview invitation",
    "schedule an interview",
    "schedule your interview",
    "book your interview",
    "interview availability",
    "next steps interview",
    "technical interview",
    "onsite interview",
    "virtual interview",
    "final interview",
    "panel interview"
]
export const SCHEDULING_PLATFORMS = [
    "calendly.com",
    "goodtime.io",
    "hirevue.com",
    "coderpad.io",
    "codesignal.com",
    "karat.io",
    "hackerrank.com",
    "codility.com"
]
export const ASSESSMENT_KEYWORDS = [
    "coding challenge",
    "technical assessment",
    "online assessment",
    "coding test",
    "take home assignment",
    "take home challenge",
    "hackerRank test",
    "codility test",
    "codesignal assessment",
    "technical challenge"
]
export const REJECTION_KEYWORDS = [
    "we regret to inform you",
    "unfortunately",
    "we will not be moving forward",
    "not moving forward",
    "we have decided to pursue other candidates",
    "after careful consideration",
    "position has been filled",
    "another candidate"
]
export const OFFER_KEYWORDS = [
    "job offer",
    "offer letter",
    "we are pleased to offer",
    "offer of employment",
    "compensation package",
    "formal offer",
    "employment offer"
]
export const NEGATIVE_KEYWORDS = [
    "unsubscribe",
    "newsletter",
    "promotion",
    "marketing",
    "event",
    "webinar",
    "course",
    "bootcamp",
    "sale",
    "discount"
]
export const COMPANY_RECRUITING_PREFIXES = [
    "careers@",
    "jobs@",
    "talent@",
    "recruiting@",
    "hr@"
]

export const gmailFilters = {
    jobSenders: JOB_PLATFORM_SENDERS,
    exactSenders: EXACT_JOB_SENDERS,
    schedulingPlatforms: SCHEDULING_PLATFORMS,
    recruitingPrefixes: COMPANY_RECRUITING_PREFIXES,
    negativeKeywords: NEGATIVE_KEYWORDS
}

export const stageKeywords = {
    applied: APPLICATION_CONFIRMATION,
    recruiter: RECRUITER_OUTREACH,
    interview: INTERVIEW_INVITES,
    assessment: ASSESSMENT_KEYWORDS,
    rejected: REJECTION_KEYWORDS,
    offer: OFFER_KEYWORDS
}
export const gmailQuery = `
category:primary newer_than:30d (
  from:linkedin.com OR
  from:indeed.com OR
  from:naukri.com OR
  from:greenhouse.io OR
  from:lever.co OR
  from:ashbyhq.com OR
  from:workday.com OR
  from:smartrecruiters.com OR
  from:jobvite.com OR
  from:icims.com OR
  from:careers@ OR
  from:jobs@ OR
  from:recruiting@ OR
  from:talent@ OR
  from:hire@
)
OR subject:(interview OR application OR applied OR assessment OR recruiter OR applying)
`