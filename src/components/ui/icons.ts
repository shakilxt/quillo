import {
  BadgeCheck,
  BellRing,
  ChartColumnIncreasing,
  CreditCard,
  Globe,
  ReceiptText,
  Repeat,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/data/product";

/** product.ts names icons with plain keys; this is the one place they become components. */
export const icons: Record<IconName, LucideIcon> = {
  invoice: ReceiptText,
  card: CreditCard,
  bell: BellRing,
  repeat: Repeat,
  globe: Globe,
  chart: ChartColumnIncreasing,
  "user-plus": UserPlus,
  send: Send,
  "badge-check": BadgeCheck,
};
