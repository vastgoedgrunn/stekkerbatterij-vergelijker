"use client";

import { useEffect } from "react";
import { logger } from "@/lib/observability/logger";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Onverwachte fout in route-segment", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main id="main-content" className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Er ging iets mis</h1>
      <p className="text-muted-foreground">
        Er is een onverwachte fout opgetreden. Probeer het opnieuw.
      </p>
      <button
        type="button"
        onClick={reset}
        className="bg-primary text-primary-foreground focus-visible:ring-ring rounded-md px-4 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:outline-none"
      >
        Opnieuw proberen
      </button>
    </main>
  );
}
