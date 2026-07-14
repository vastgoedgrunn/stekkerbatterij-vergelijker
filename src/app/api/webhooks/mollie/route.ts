import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { processMolliePayment } from "@/features/checkout/fulfillment.server";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

/**
 * Mollie-webhook: /api/webhooks/mollie
 * Mollie POST't het payment-id (form-encoded). We her-bevragen de betaalstatus
 * via de Mollie API (geen vertrouwen op de payload) en werken order + betaling
 * idempotent bij via de service-role client. Antwoordt altijd met 200 wanneer
 * de melding verwerkt of veilig genegeerd is; 500 laat Mollie het opnieuw
 * proberen bij een tijdelijke fout.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let paymentId: string | null = null;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body: unknown = await request.json();
      if (typeof body === "object" && body !== null && "id" in body) {
        paymentId = String((body as { id: unknown }).id);
      }
    } else {
      const form = await request.formData();
      const id = form.get("id");
      if (typeof id === "string") paymentId = id;
    }
  } catch {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  if (!paymentId) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    const result = await processMolliePayment(paymentId);
    if (!result.handled) {
      // Niet-geconfigureerd of onbekende order: veilig negeren (geen retry-storm).
      return NextResponse.json({ received: true, reason: result.reason }, { status: 200 });
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Mollie-webhook verwerking mislukt", {
      message: error instanceof Error ? error.message : "onbekend",
    });
    // 500 zodat Mollie het later opnieuw probeert.
    return NextResponse.json({ error: "processing-failed" }, { status: 500 });
  }
}
