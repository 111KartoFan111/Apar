import clsx from "clsx";
import { useTranslation } from "react-i18next";
import styles from "./StatusBadge.module.css";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const toneMap: Record<string, Tone> = {
  active: "success",
  ok: "success",
  paid: "success",
  approved: "success",
  received: "success",
  done: "success",
  completed: "success",
  "in stock": "success",
  in: "success",
  available: "success",
  installed: "success",
  draft: "neutral",
  inactive: "neutral",
  cancelled: "neutral",
  canceled: "neutral",
  retired: "neutral",
  service: "warning",
  pending: "warning",
  maintenance: "warning",
  scheduled: "warning",
  unpaid: "danger",
  out: "danger",
  overdue: "danger",
  alert: "danger",
  failed: "danger",
  rejected: "danger",
  submitted: "info",
  planned: "info",
  "in transit": "info",
  "in progress": "info",
  processing: "info",
  transfer: "info"
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const inferTone = (status?: string | null): Tone => {
  if (!status) {
    return "neutral";
  }

  const normalized = normalize(status);
  if (!normalized) {
    return "neutral";
  }

  const direct = toneMap[normalized];
  if (direct) {
    return direct;
  }

  if (normalized.includes("maint")) {
    return "warning";
  }

  if (normalized.includes("alert") || normalized.includes("overdue")) {
    return "danger";
  }

  if (normalized.includes("transit")) {
    return "info";
  }

  return "neutral";
};

const toTranslationKey = (normalized: string) => normalized.replace(/\s+/g, "_");

type Props = {
  status?: string | null;
  className?: string;
};

export function StatusBadge({ status, className }: Props) {
  const { t, i18n } = useTranslation();
  const label = status?.toString().trim() || "-";
  const normalized = status ? normalize(label) : "";
  const tone = inferTone(status);
  const translationKey = normalized ? `statusLabels.${toTranslationKey(normalized)}` : "";
  const translated = translationKey && i18n.exists(translationKey) ? t(translationKey) : label;

  return <span className={clsx(styles.badge, styles[tone], className)}>{translated}</span>;
}
