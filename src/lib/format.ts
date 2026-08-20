export function formatMontant(value: string | number | null | undefined, devise = "FCFA"): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return "—";
  const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n);
  return `${formatted} ${devise}`;
}

export function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function initials(nom?: string | null, prenom?: string | null): string {
  const a = (prenom ?? "").trim()[0] ?? "";
  const b = (nom ?? "").trim()[0] ?? "";
  const value = `${a}${b}`.toUpperCase();
  return value || "?";
}

export function fullName(nom?: string | null, prenom?: string | null): string {
  return [prenom, nom].filter(Boolean).join(" ") || "—";
}

// Convertit une date ISO (UTC, telle que renvoyée par l'API) vers la valeur attendue par un
// <input type="datetime-local"> — qui doit être exprimée en heure LOCALE du navigateur. Un simple
// iso.slice(0, 16) prend les chiffres UTC tels quels et les fait passer pour du local : l'heure
// affichée est fausse, et chaque ré-enregistrement décale un peu plus la date stockée.
export function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Sens inverse : reconvertit la valeur locale d'un <input type="datetime-local"> en ISO UTC avant
// de l'envoyer à l'API.
export function fromDatetimeLocal(local: string | null | undefined): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
