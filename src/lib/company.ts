import { z } from "zod";

export const applicationSchema = z.object({
  company_name: z.string().trim().min(2, "Fyll i företagsnamn").max(120),
  org_number: z.string().trim().max(20).optional().or(z.literal("")),
  contact_name: z.string().trim().min(2, "Fyll i kontaktperson").max(100),
  phone: z.string().trim().min(5, "Fyll i telefonnummer").max(30),
  email: z.string().trim().toLowerCase().email("Ogiltig e-post").max(255),
  seats: z.coerce.number().int().min(1, "Minst 1 tekniker").max(500, "Max 500"),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});
export type ApplicationInput = z.infer<typeof applicationSchema>;

export const memberEmailSchema = z.string().trim().toLowerCase().email("Ogiltig e-post").max(255);
