"use client";

import { useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { approveUser, rejectUser, updateUserRole } from "./actions";
import type { UserApproval } from "@/generated/prisma";

const STATUS_ORDER: Record<string, number> = { PENDING: 0, APPROVED: 1, REJECTED: 2 };

const ROLES = ["ADMIN", "AGENT", "MECHANIC"] as const;

function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    AGENT: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    MECHANIC: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[role] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {role.charAt(0) + role.slice(1).toLowerCase()}
    </span>
  );
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
}

function UserRow({ user }: { user: UserApproval }) {
  const [pending, startTransition] = useTransition();

  return (
    <TableRow className={pending ? "opacity-50" : undefined}>
      <TableCell className="pl-6">
        <div className="flex items-center gap-3">
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={user.status} />
      </TableCell>
      <TableCell>
        {user.status === "APPROVED" ? (
          <select
            defaultValue={user.role}
            disabled={pending}
            onChange={(e) => startTransition(() => updateUserRole(user.id, e.target.value))}
            className="text-xs rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r.charAt(0) + r.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        ) : (
          <RoleBadge role={user.role} />
        )}
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {fmtDate(user.createdAt)}
      </TableCell>
      <TableCell className="text-right pr-6">
        <div className="flex items-center justify-end gap-2">
          {user.status !== "APPROVED" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              disabled={pending}
              onClick={() => startTransition(() => approveUser(user.id))}
            >
              Approve
            </Button>
          )}
          {user.status !== "REJECTED" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              disabled={pending}
              onClick={() => startTransition(() => rejectUser(user.id))}
            >
              Reject
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

export function UsersTab({ users }: { users: UserApproval[] }) {
  const sorted = [...users].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9)
  );

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-sm text-muted-foreground">No users have signed in yet.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-6">User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right pr-6">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((u) => (
          <UserRow key={u.id} user={u} />
        ))}
      </TableBody>
    </Table>
  );
}
