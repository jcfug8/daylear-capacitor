export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function userFirstInitial(name: string): string {
  const first = name.trim().split(/\s+/).filter(Boolean)[0];
  return first ? first[0]!.toUpperCase() : "?";
}
