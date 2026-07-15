import { listChangeRequests } from "@/features/admin/queries";
import { reviewChangeRequestAction } from "@/features/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminChangesPage() {
  let changes: Awaited<ReturnType<typeof listChangeRequests>> = [];
  let loadError: string | null = null;
  try {
    changes = await listChangeRequests();
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Kon wijzigingsvoorstellen niet laden.";
  }

  const pending = changes.filter((item) => item.status === "pending");
  const history = changes.filter((item) => item.status !== "pending");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Reviewwachtrij</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Agent-voorstellen voor prijzen, feiten en content. Goedkeuren of afwijzen vóór publicatie.
      </p>

      {loadError ? (
        <p className="text-destructive mt-6 text-sm">{loadError}</p>
      ) : (
        <>
          <section className="mt-8 space-y-4">
            <h2 className="font-semibold">Open ({pending.length})</h2>
            {pending.length === 0 ? (
              <p className="text-muted-foreground text-sm">Geen open voorstellen.</p>
            ) : (
              pending.map((item) => (
                <article key={item.id} className="border-border rounded-2xl border p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{item.kind}</Badge>
                    <span className="text-muted-foreground text-xs">{item.source}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                  <p className="mt-3 font-medium">{item.summary}</p>
                  {item.source_url && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      Bron:{" "}
                      <a
                        href={item.source_url}
                        className="text-primary underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.source_url}
                      </a>
                    </p>
                  )}
                  <pre className="bg-muted mt-3 overflow-x-auto rounded-lg p-3 text-xs">
                    {JSON.stringify(item.proposed, null, 2)}
                  </pre>
                  <form action={reviewChangeRequestAction} className="mt-4 space-y-3">
                    <input type="hidden" name="id" value={item.id} />
                    <Textarea name="reviewNotes" rows={2} placeholder="Optionele toelichting" />
                    <div className="flex gap-2">
                      <Button type="submit" name="decision" value="approved" size="sm">
                        Goedkeuren
                      </Button>
                      <Button
                        type="submit"
                        name="decision"
                        value="rejected"
                        size="sm"
                        variant="outline"
                      >
                        Afwijzen
                      </Button>
                    </div>
                  </form>
                </article>
              ))
            )}
          </section>

          {history.length > 0 && (
            <section className="mt-10 space-y-3">
              <h2 className="font-semibold">Historie</h2>
              {history.map((item) => (
                <div key={item.id} className="border-border rounded-xl border p-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="muted">{item.status}</Badge>
                    <span>{item.summary}</span>
                  </div>
                  {item.review_notes && (
                    <p className="text-muted-foreground mt-2">{item.review_notes}</p>
                  )}
                </div>
              ))}
            </section>
          )}
        </>
      )}
    </div>
  );
}
