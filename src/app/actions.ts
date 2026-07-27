"use server";

import { compare } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, createAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function normalizeFormData(formData: FormData) {
  const normalized = new FormData();
  for (const [key, value] of formData.entries()) {
    if (/^\d+$/.test(key)) continue;
    normalized.append(key.replace(/^\d+_/, ""), value);
  }
  return normalized;
}

const voteSchema = z.object({
  name: z.string().trim().min(3).max(100),
  phone: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().min(10).max(13)),
  apartment: z.string().trim().min(1).max(10),
  tower: z.string().trim().min(1).max(30),
  windowCount: z.coerce.number().int().min(1).max(30),
  hasBalcony: z.enum(["yes", "no"]),
  notes: z.string().trim().max(400).optional(),
});

export async function saveVote(formData: FormData) {
  const normalized = normalizeFormData(formData);
  const parsed = voteSchema.safeParse(Object.fromEntries(normalized));
  const services = z.array(z.enum(["BLACKOUT", "BLIND", "WALLPAPER", "CURTAIN", "OTHER"]))
    .min(1)
    .safeParse(normalized.getAll("services"));
  if (!parsed.success || !services.success) redirect("/?erro=dados");

  const data = parsed.data;
  const tower = data.tower.toUpperCase();
  const apartment = data.apartment.toUpperCase();
  const existing = await prisma.vote.findUnique({
    where: { tower_apartment: { tower, apartment } },
  });

  if (existing && existing.phone !== data.phone) {
    redirect("/?erro=ocupado");
  }

  const values = {
    name: data.name,
    phone: data.phone,
    tower,
    apartment,
    windowCount: data.windowCount,
    hasBalcony: data.hasBalcony === "yes",
    services: services.data,
    notes: data.notes || null,
  };

  try {
    await prisma.vote.upsert({
      where: { tower_apartment: { tower, apartment } },
      create: values,
      update: values,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) redirect("/?erro=salvar");
    throw error;
  }
  redirect("/?sucesso=1");
}

export async function loginAdmin(formData: FormData) {
  const normalized = normalizeFormData(formData);
  const username = String(normalized.get("username") || "");
  const password = String(normalized.get("password") || "");
  const validUser = username === (process.env.MASTER_USERNAME || "lucas.pardinho");
  const hash = process.env.MASTER_PASSWORD_HASH || "";
  const validPassword = hash ? await compare(password, hash) : false;
  if (!validUser || !validPassword) redirect("/admin?erro=login");
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/");
}
