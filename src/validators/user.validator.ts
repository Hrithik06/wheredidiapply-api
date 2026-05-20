// import { z } from "zod";

// const isValidTimezone = (tz: string) => {
//   try {
//     Intl.DateTimeFormat(undefined, { timeZone: tz });
//     return true;
//   } catch {
//     return false;
//   }
// };

// export const updateTimezoneSchema = z.object({
//   timezone: z.string().refine(isValidTimezone, {
//     message: "Invalid timezone",
//   }),
// });
