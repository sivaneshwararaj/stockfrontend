import { z } from "zod";

export const loginUserSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email({ message: "Email must be a valid email." }),
  password: z.string({ required_error: "Password is required" }),
});

export const registerUserSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Email must be a valid email" }),
    password: z
      .string({ required_error: "Password is required" })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&+\-,.\[\]{};':"\\|/=\(\)\^_*]{8,}$/,
        {
          message:
            "Password must be a minimum of 8 characters & contain at least one letter, one number, and one special character.",
        },
      ),
    passwordConfirm: z
      .string({ required_error: "Confirm Password is required" })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&+\-,.\[\]{};':"\\|/=\(\)\^_*]{8,}$/,
        {
          message:
            "Password must be a minimum of 8 characters & contain at least one letter, one number, and one special character.",
        },
      ),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password & Confirm password must match",
        path: ["password"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password & Confirm password must match",
        path: ["passwordConfirm"],
      });
    }
  });




export const updatePasswordSchema = z
  .object({
    oldPassword: z.string({ required_error: "Old password is required" }),
    password: z
      .string({ required_error: "Password is required" })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&+\-,.\[\]{};':"\\|/=\(\)\^_*]{8,}$/,
        {
          message:
            "Password must be a minimum of 8 characters & contain at least one letter, one number, and one special character.",
        },
      ),
    passwordConfirm: z
      .string({ required_error: "Confirm Password is required" })
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&+\-,.\[\]{};':"\\|/=\(\)\^_*]{8,}$/,
        {
          message:
            "Password must be a minimum of 8 characters & contain at least one letter, one number, and one special character.",
        },
      ),
  })
  .superRefine(({ passwordConfirm, password }, ctx) => {
    if (passwordConfirm !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password & Confirm password must match",
        path: ["password"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password & Confirm password must match",
        path: ["passwordConfirm"],
      });
    }
  });




export const createStrategySchema = z.object({
  title: z
    .string({ required_error: "Title cannot be empty" })
    .min(1, { message: "Title cannot be empty" })
    .max(100, {
      message: "Title is too long. Keep it simple and concise bruv!",
    })
    .trim(),
  rules: z.string().trim(),
  results: z.string().trim(),
  liveResults: z.string().trim(),
  user: z.string({ required_error: "User is required." }),
});

export const createPortfolioSchema = z.object({
  accountValue: z.string().trim(),
  availableCash: z.string().trim(),
  overallReturn: z.string().trim(),
  rank: z.string().trim(),
  holdings: z.string().trim(),
  tradingHistory: z.string().trim(),
  metrics: z.string().trim(),
  user: z.string({ required_error: "User is required." }),
});

export const createWatchListSchema = z.object({
  title: z
    .string({ required_error: "Title cannot be empty" })
    .min(1, { message: "Title cannot be empty" })
    .max(100, {
      message: "Title is too long. Keep it simple and concise bruv!",
    })
    .trim(),
  ticker: z.string().trim(),
  user: z.string({ required_error: "User is required." }),
});

export const editWatchListSchema = z.object({
  title: z
    .string({ required_error: "Title cannot be empty" })
    .min(1, { message: "Title cannot be empty" })
    .max(100, {
      message: "Title is too long. Keep it simple and concise bruv!",
    })
    .trim(),
  watchListId: z.string({ required_error: "Id is required." }),
});
