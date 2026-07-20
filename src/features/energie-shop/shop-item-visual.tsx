import {
  BatteryCharging,
  Cable,
  Gauge,
  Monitor,
  Plug,
  Split,
  Zap,
  Dock,
  type LucideIcon,
} from "lucide-react";
import type { ShopCatalogItem } from "./catalog";

const ICONS: Record<ShopCatalogItem["icon"], LucideIcon> = {
  gauge: Gauge,
  plug: Plug,
  split: Split,
  cable: Cable,
  socket: Zap,
  display: Monitor,
  battery: BatteryCharging,
  dock: Dock,
};

const ACCENTS: Record<ShopCatalogItem["accent"], string> = {
  green: "from-primary/20 to-primary/5 text-primary",
  amber: "from-highlight/30 to-highlight/5 text-highlight-foreground",
  blue: "from-info/20 to-info/5 text-info",
  slate: "from-muted to-muted/40 text-muted-foreground",
};

export function ShopItemVisual({
  item,
  className = "",
}: {
  item: Pick<ShopCatalogItem, "icon" | "accent" | "name">;
  className?: string;
}) {
  const Icon = ICONS[item.icon];
  return (
    <div
      className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${ACCENTS[item.accent]} ${className}`}
      aria-hidden
    >
      <div className="bg-background/50 absolute inset-0 backdrop-blur-[1px]" />
      <Icon className="relative size-12 sm:size-14" strokeWidth={1.5} />
      <span className="sr-only">{item.name}</span>
    </div>
  );
}
