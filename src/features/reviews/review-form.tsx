"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { businessRules } from "@/config/business-rules";
import { submitReview, type ReviewFormState } from "./actions";

const initialState: ReviewFormState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Bezig…" : "Review plaatsen"}
    </Button>
  );
}

export function ReviewForm({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [state, formAction] = useActionState(submitReview, initialState);

  if (state.status === "success") {
    return (
      <p className="bg-success/10 text-success border-success/20 rounded-lg border p-4 text-sm">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="border-border bg-card space-y-4 rounded-2xl border p-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="productSlug" value={productSlug} />

      <div className="space-y-2">
        <Label htmlFor="rating">Beoordeling</Label>
        <Select id="rating" name="rating" defaultValue="5" className="w-40">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "ster" : "sterren"}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Titel (optioneel)</Label>
        <Input id="title" name="title" maxLength={120} placeholder="Korte samenvatting" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Je ervaring</Label>
        <Textarea
          id="body"
          name="body"
          required
          minLength={businessRules.reviews.bodyMinLength}
          maxLength={businessRules.reviews.bodyMaxLength}
          placeholder="Deel je ervaring met dit product…"
        />
      </div>

      {state.status === "error" && state.message && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}
