"use client";

import * as React from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/observability/analytics";

/**
 * Vuurt eenmalig een analytics-event af bij het mounten van een pagina/sectie.
 * Bewust een lege renderer zodat het veilig in server components te plaatsen is
 * (het event-object moet serialiseerbaar zijn). No-op wanneer Plausible ontbreekt.
 */
export function TrackView({ event }: { event: AnalyticsEvent }) {
  const fired = React.useRef(false);

  React.useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    trackEvent(event);
  }, [event]);

  return null;
}
