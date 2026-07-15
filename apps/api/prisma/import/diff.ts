export type RowAction = "insert" | "update" | "skip";

// existingHashes: naturalKey -> previously stored row hash (from
// ImportRowHash). Pure classification - no DB access here, so the
// idempotence/insert/update behaviors are fully unit-testable without a
// live database.
export function classifyRow(
  naturalKey: string,
  newHash: string,
  existingHashes: Map<string, string>,
): RowAction {
  const existingHash = existingHashes.get(naturalKey);
  if (existingHash === undefined) return "insert";
  if (existingHash !== newHash) return "update";
  return "skip";
}

// Natural keys tracked in ImportRowHash that no longer appear in the
// current file - reported for manual review, never touched automatically
// (see decision in the task prompt: report-only by default, --prune opts
// into a soft-delete).
export function findOrphans(
  currentNaturalKeys: Set<string>,
  existingHashes: Map<string, string>,
): string[] {
  return [...existingHashes.keys()].filter(
    (key) => !currentNaturalKeys.has(key),
  );
}
