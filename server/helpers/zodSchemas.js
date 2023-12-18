import { z } from "zod";

// super admin validations

// zod validation super-admin register body
export const superAdminRegisterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// **********************************************************************

// admin validations

// zod validation admin register body
export const adminRegisterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// zod validation admin profile update body

export const adminProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .optional(),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .optional(),
  gstin: z
    .string()
    .regex(/^\d{2}[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: "Invalid GST number format",
    })
    .optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  address: z
    .object({
      country: z
        .string()
        .min(2, { message: "Country must be at least 2 characters" })
        .optional(),
      state: z
        .string()
        .min(2, { message: "State must be at least 2 characters" })
        .optional(),
      city: z
        .string()
        .min(2, { message: "City must be at least 2 characters" })
        .optional(),
      pincode: z
        .string()
        .min(6, { message: "Pincode must be at least 6 digits" })
        .optional(),
      street: z
        .string()
        .min(3, { message: "Street must be at least 3 characters" })
        .optional(),
      landmark: z.string().optional(),
    })
    .optional(),
  social: z
    .object({
      website: z.string().url({ message: "Invalid website URL" }).optional(),
      linkedin: z.string().url({ message: "Invalid LinkedIn URL" }).optional(),
      twitter: z.string().url({ message: "Invalid Twitter URL" }).optional(),
      facebook: z.string().url({ message: "Invalid Facebook URL" }).optional(),
      instagram: z
        .string()
        .url({ message: "Invalid Instagram URL" })
        .optional(),
    })
    .optional(),
});

// **********************************************************************

// user validation

// zod validation user register body
export const userRegisterSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" }),
  designation: z
    .string()
    .min(2, { message: "Designation must be at least 2 characters" }),
  location: z
    .string()
    .min(2, { message: "Location must be at least 2 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// **********************************************************************

// common validation

// zod validation login body
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be atleast 6 characters long" }),
});
