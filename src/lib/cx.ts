export type ClassValue = string | false | null | undefined;

/** Joins conditional class names. Components expose variants rather than free-form overrides. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
