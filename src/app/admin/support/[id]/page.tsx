import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { getAdminDb } from "@/features/admin/db.server";
import { getSupportTicket } from "@/features/support/support.server";
import { approveSupportReplyAction, draftSupportReplyAction } from "@/features/support/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import type { ApprovalActionRow } from "@/lib/db/database.types";

export const dynamic = "force-dynamic";

export default async function AdminSupportTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let ticket: Awaited<ReturnType<typeof getSupportTicket>> = null;
  let pendingReply: ApprovalActionRow | null = null;
  try {
    ticket = await getSupportTicket(id);
    if (ticket) {
      const db = getAdminDb();
      const { data } = await db
        .from("approval_actions")
        .select("*")
        .eq("support_ticket_id", id)
        .eq("kind", "support_reply")
        .eq("status", "pending")
        .maybeSingle<ApprovalActionRow>();
      pendingReply = data;
    }
  } catch {
    notFound();
  }
  if (!ticket) notFound();

  return (
    <div className="max-w-2xl">
      <Link
        href={"/admin/support" as Route}
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Alle tickets
      </Link>
      <div className="mt-4 flex items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
        <Badge variant="muted">{ticket.status}</Badge>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">
        {ticket.customer_email} · {formatDate(ticket.created_at)}
      </p>

      <article className="border-border mt-6 rounded-xl border p-4 text-sm whitespace-pre-wrap">
        {ticket.body}
      </article>

      {pendingReply ? (
        <section className="border-border mt-8 space-y-3 border-t pt-6">
          <h2 className="font-semibold">Concept wacht op goedkeuring</h2>
          <p className="text-sm whitespace-pre-wrap">{pendingReply.email_body_text}</p>
          <form action={approveSupportReplyAction}>
            <input type="hidden" name="actionId" value={pendingReply.id} />
            <input type="hidden" name="ticketId" value={ticket.id} />
            <Button type="submit" size="sm">
              Goedkeuren &amp; versturen
            </Button>
          </form>
        </section>
      ) : (
        <form
          action={draftSupportReplyAction}
          className="border-border mt-8 space-y-3 border-t pt-6"
        >
          <input type="hidden" name="ticketId" value={ticket.id} />
          <h2 className="font-semibold">Concept-antwoord</h2>
          <Textarea name="draftBody" rows={5} placeholder="Schrijf een antwoord…" required />
          <Button type="submit" size="sm">
            Opslaan ter goedkeuring
          </Button>
        </form>
      )}
    </div>
  );
}
