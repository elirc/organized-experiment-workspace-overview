import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/auth/session";
import { exportableLeads } from "@/modules/crm/service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rows = await exportableLeads(user);
  const header = ["id", "fullName", "email", "source", "status", "owner", "score"];
  const csv = [header.join(","), ...rows.map((row) => header.map((key) => JSON.stringify(row[key as keyof typeof row] ?? "")).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="leads-export.csv"'
    }
  });
}
