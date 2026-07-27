"use server";

import { compare } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, createAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const voteSchema = z.object({
  name: z.string().trim().min(3).max(100),
  phone: z.string().transform((value) => value.replace(/\D/g, "")).pipe(z.string().min(10).max(13)),
  apartment: z.string().trim().min(1).max(10),
  tower: z.string().trim().min(1).max(30),
  windowCount: z.coerce.number().int().min(1).max(30),
  windowChoice: z.enum(["CURTAIN", "BLIND", "NONE"]),
  hasBalcony: z.enum(["yes", "no"]),
  balconyChoice: z.enum(["CURTAIN", "BLIND", "NONE"]).optional(),
  notes: z.string().trim().max(400).optional(),
});

export async function saveVote(formData: FormData) {
  const parsed = voteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect("/?erro=dados");

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
    windowChoice: data.windowChoice,
    hasBalcony: data.hasBalcony === "yes",
    balconyChoice: data.hasBalcony === "yes" ? data.balconyChoice || "NONE" : null,
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
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
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
