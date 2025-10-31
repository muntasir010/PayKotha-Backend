// /* eslint-disable @typescript-eslint/no-explicit-any */
import { ZodError } from "zod";
import { TErrorSources, TGenericErrorResponse } from "../interface/error.types";


// export const handleZodError = (err: any): TGenericErrorResponse => {
//   const errorSources: TErrorSources[] = [];
//   err.issues.forEach((issue: any) => {
//     errorSources.push({
//       path: issue.path[issue.path.length - 1],
//       message: issue.message,
//     });
//   });
//   return {
//     statusCode: 400,
//     errorSources,
//     message: "Zod Error.",
//   };
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources[] = [];

  err.issues.forEach((issue: any) => {
    errorSources.push({
      path: issue.path[issue.path.length - 1],
      message: issue.message,
    });
  });

  return {
    statusCode: 400,
    errorSources,
    message: errorSources[0]?.message || "Zod Error",
  };
};