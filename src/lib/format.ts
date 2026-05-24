import type { Currency } from "./types";

export function formatMoney(amount: number, currency: Currency): string {
  const value = Number.isFinite(amount) ? amount : 0;
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return `${new Intl.NumberFormat("uz-UZ").format(Math.round(value))} UZS`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
