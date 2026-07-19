import "server-only";
import { createHash } from "crypto";
import { generateObject } from "ai";
import { z } from "zod";
import { serverEnv } from "@/lib/env/server";

const visionSchema = z.object({
  decision: z.enum(["accept", "reject"]),
  subject: z.enum(["battery", "inverter", "panel", "seal", "lifestyle", "other"]),
  reason: z.string().min(1).max(240),
});

export type VisionGateResult = z.infer<typeof visionSchema>;

function visionEnabled(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

/**
 * Vision-gate via Vercel AI Gateway. Faalt open (accept) niet: bij ontbrekende
 * auth of API-fout → reject met reason, zodat heuristics/feed de volgende bron probeert.
 * Alleen subject=battery (of duidelijke battery-packshot) mag door.
 */
export async function classifyProductImage(input: {
  imageUrl: string;
  productName: string;
  productType: "plug_in" | "fixed";
}): Promise<VisionGateResult> {
  if (!visionEnabled()) {
    return {
      decision: "accept",
      subject: "battery",
      reason: "Vision overgeslagen (geen AI Gateway auth); heuristics OK",
    };
  }

  try {
    const { object } = await generateObject({
      model: "openai/gpt-5.4",
      schema: visionSchema,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: [
                "Je beoordeelt productfoto's voor een Nederlandse stekkerbatterij-/thuisbatterij-vergelijker.",
                `Product: ${input.productName} (type: ${input.productType}).`,
                "Accept alleen als de foto duidelijk de batterij/het opslagsysteem toont (packshot of duidelijke productfoto).",
                "Reject bij: keurmerk/seal, logo-only, zonnepaneel zonder batterij, losse micro-omvormer zonder batterij,",
                "lifestyle waarbij het product nauwelijks zichtbaar is, of verkeerd apparaat.",
                "subject=battery als het een batterij/opslagsysteem is (ook all-in-one met geïntegreerde omvormer).",
              ].join(" "),
            },
            { type: "image", image: new URL(input.imageUrl) },
          ],
        },
      ],
    });

    if (object.decision === "accept" && object.subject !== "battery") {
      return {
        decision: "reject",
        subject: object.subject,
        reason: `Subject ${object.subject} i.p.v. battery`,
      };
    }
    return object;
  } catch (error) {
    return {
      decision: "reject",
      subject: "other",
      reason: `Vision-fout: ${error instanceof Error ? error.message : "onbekend"}`,
    };
  }
}

export function sha256Hex(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

export async function maybeCutoutBackground(buffer: Buffer): Promise<{
  buffer: Buffer;
  contentType: string;
  applied: boolean;
}> {
  const apiKey = serverEnv.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return { buffer, contentType: "image/jpeg", applied: false };
  }

  try {
    const form = new FormData();
    form.append("size", "auto");
    form.append("format", "png");
    form.append(
      "image_file",
      new Blob([Uint8Array.from(buffer)], { type: "image/jpeg" }),
      "product.jpg",
    );

    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": apiKey },
      body: form,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      return { buffer, contentType: "image/jpeg", applied: false };
    }
    const out = Buffer.from(await res.arrayBuffer());
    if (out.byteLength < 1024) {
      return { buffer, contentType: "image/jpeg", applied: false };
    }
    return { buffer: out, contentType: "image/png", applied: true };
  } catch {
    return { buffer, contentType: "image/jpeg", applied: false };
  }
}
