"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { StaffRole, UserStatus } from "@/generated/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function approveUser(id: string) {
  await requireAdmin();
  await db.userApproval.update({
    where: { id },
    data: { status: "APPROVED" as UserStatus },
  });
  revalidatePath("/admin/settings");
}

export async function rejectUser(id: string) {
  await requireAdmin();
  await db.userApproval.update({
    where: { id },
    data: { status: "REJECTED" as UserStatus },
  });
  revalidatePath("/admin/settings");
}

export async function updateUserRole(id: string, role: string) {
  await requireAdmin();
  await db.userApproval.update({
    where: { id },
    data: { role: role as StaffRole },
  });
  revalidatePath("/admin/settings");
}
