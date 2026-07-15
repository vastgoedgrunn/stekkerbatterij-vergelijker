"use client";

import Link from "next/link";
import type { Route } from "next";
import { Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/observability/analytics";

/** Compacte upsell naar energiecontracten na beslishulp/vergelijking. */
export function EnergyUpsellStrip({ className }: { className?: string }) {
  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-highlight/20 text-highlight flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Zap className="size-5" />
          </div>
          <div>
            <p className="font-semibold">Past een dynamisch energiecontract bij jouw batterij?</p>
            <p className="text-muted-foreground mt-0.5 text-sm">
              Met dynamische tarieven laad je goedkoper — ideaal in combinatie met opslag.
            </p>
          </div>
        </div>
        <Link
          href={"/energie" as Route}
          onClick={() => trackEvent({ name: "energy_cta_clicked", props: { placement: "wizard" } })}
          className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
        >
          Vergelijk energie
        </Link>
      </CardContent>
    </Card>
  );
}
