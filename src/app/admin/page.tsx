import { redirect } from "next/navigation";
import type { Route } from "next";

export default function AdminIndexPage() {
  redirect("/admin/orders" as Route);
}
