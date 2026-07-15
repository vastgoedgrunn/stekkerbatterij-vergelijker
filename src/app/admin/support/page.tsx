import Link from "next/link";
import type { Route } from "next";
import { listSupportTickets } from "@/features/support/support.server";
import { isSupportInboundConfigured } from "@/features/support/support.server";
import { createSupportTicketAction } from "@/features/support/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminSupportPage() {
  let tickets: Awaited<ReturnType<typeof listSupportTickets>> = [];
  let loadError: string | null = null;
  try {
    tickets = await listSupportTickets();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon tickets niet laden.";
  }

  const inboundReady = isSupportInboundConfigured();

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold tracking-tight">Klantenservice</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Concept-antwoorden en refunds wachten op goedkeuring. Live inbound e-mail volgt zodra
        Gmail/Workspace of een helpdesk is gekoppeld.
      </p>

      {!inboundReady && (
        <p className="border-border bg-muted/40 mt-4 rounded-xl border px-4 py-3 text-sm">
          Inbound e-mail is nog niet geactiveerd. Tickets kun je handmatig aanmaken; antwoorden
          stuur je pas na goedkeuring (en alleen als Resend/EMAIL_FROM is ingesteld).
        </p>
      )}

      <form
        action={createSupportTicketAction}
        className="border-border mt-8 space-y-4 rounded-2xl border p-6"
      >
        <h2 className="font-semibold">Handmatig ticket</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Klant e-mail</Label>
            <Input id="customerEmail" name="customerEmail" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orderId">Order-ID (optioneel)</Label>
            <Input id="orderId" name="orderId" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="subject">Onderwerp</Label>
            <Input id="subject" name="subject" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="body">Bericht</Label>
            <Textarea id="body" name="body" rows={4} required />
          </div>
        </div>
        <Button type="submit" size="sm">
          Ticket aanmaken
        </Button>
      </form>

      {loadError ? (
        <p className="text-destructive mt-6 text-sm">{loadError}</p>
      ) : (
        <div className="border-border mt-8 overflow-hidden rounded-2xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Onderwerp</TableHead>
                <TableHead>Klant</TableHead>
                <TableHead>Datum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Badge variant="muted">{ticket.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/support/${ticket.id}` as Route}
                      className="font-medium hover:underline"
                    >
                      {ticket.subject}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{ticket.customer_email}</TableCell>
                  <TableCell>{formatDate(ticket.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
