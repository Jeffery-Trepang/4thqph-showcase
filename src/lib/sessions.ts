export const SESSION_TYPES = [
  "Athletic Development (High School)",
  "Athletic Development (University/College)",
  "Women's Strength & Stretch",
  "Men's Strength & Conditioning",
] as const;

export type SessionType = (typeof SESSION_TYPES)[number];

export function isSessionType(value: unknown): value is SessionType {
  return typeof value === "string" && (SESSION_TYPES as readonly string[]).includes(value);
}

// URL slug -> session type, used by /services "Book Now" deep links and the
// /register session-type preselector.
export const SESSION_TYPE_SLUGS: Record<string, SessionType> = {
  "high-school": "Athletic Development (High School)",
  "university": "Athletic Development (University/College)",
  "women": "Women's Strength & Stretch",
  "men": "Men's Strength & Conditioning",
};

export function sessionTypeFromSlug(
  slug: string | null | undefined
): SessionType | null {
  if (!slug) return null;
  return (SESSION_TYPE_SLUGS[slug] as SessionType) ?? null;
}

// Priority order for sorting sessions of equal date/time.
export const SESSION_TYPE_ORDER: SessionType[] = [
  "Athletic Development (High School)",
  "Athletic Development (University/College)",
  "Men's Strength & Conditioning",
  "Women's Strength & Stretch",
];

export function sessionTypeRank(type: string): number {
  const idx = (SESSION_TYPE_ORDER as readonly string[]).indexOf(type);
  return idx === -1 ? 999 : idx;
}
