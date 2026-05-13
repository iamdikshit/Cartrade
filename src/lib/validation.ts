import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),
  permissions: z.array(
    z.enum([
      "cars:create",
      "cars:edit",
      "cars:delete",
      "cars:view",
      "inquiries:view",
      "inquiries:reply",
    ]),
  ),
  phone: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const carBasicSchema = z.object({
  name: z.string().min(2, "Car name required").max(200).trim(),
  make: z.string().min(1, "Make required").trim(),
  carModel: z.string().min(1, "Model required").trim(),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  variant: z.string().optional(),
  color: z.string().optional(),
  fuelType: z.enum(["petrol", "diesel", "cng", "electric", "hybrid"]),
  transmission: z.enum(["manual", "automatic", "amt"]),
  odometer: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  askingPrice: z.number().min(0).optional(),
  status: z.enum(["active", "hold", "sold"]).default("active"),
  description: z.string().max(2000).optional(),
  location: z
    .object({
      address: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    })
    .optional(),
});

export const inquirySchema = z.object({
  carId: z.string().length(24, "Invalid car ID"),
  name: z.string().min(2, "Name required").max(100).trim(),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  phone: z.string().min(10, "Valid phone number required").max(15),
  message: z.string().min(10, "Message too short").max(1000).trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type CarBasicInput = z.infer<typeof carBasicSchema>;
export type InquiryInput = z.infer<typeof inquirySchema>;

export function sanitizeString(str: string): string {
  return str.replace(/[<>'"]/g, (char) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#x27;",
      '"': "&quot;",
    };
    return map[char] || char;
  });
}
