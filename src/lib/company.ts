import { z } from "zod";
import { COMPANY_MAX_SEATS } from "@/lib/subscription";

export const companyBuySchema = z.object({
  company_name: z.string().trim().min(2, "Fyll i företagsnamn").max(120),
  org_number: z.string().trim().max(20).optional().or(z.literal("")),
  seats: z.coerce.number().int("Heltal").min(1, "Minst 1 tekniker").max(COMPANY_MAX_SEATS, `Max ${COMPANY_MAX_SEATS} – mejla oss för fler`),
});
export type CompanyBuyInput = z.infer<typeof companyBuySchema>;

export const memberEmailSchema = z.string().trim().toLowerCase().email("Ogiltig e-post").max(255);
