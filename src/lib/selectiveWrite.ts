export function isEmpty(v: any) {
  return (
    v == null ||
    (typeof v === 'string' && v.trim() === '') ||
    (Array.isArray(v) && v.length === 0)
  );
}

export function shouldWrite(current: any, incoming: any) {
  if (isEmpty(incoming)) return false;  // never write empties
  if (isEmpty(current)) return true;    // fill empty DB fields
  return false;                         // keep existing (no overwrite by default)
}

export type Diff = {
  field: string;
  old: any;
  new: any;
  action: 'write' | 'skip';
  reason: string;
};

export function computeDiffs(
  current: Record<string, any>,
  incoming: Record<string, any>,
  fieldsAllowed: string[]
): Diff[] {
  const diffs: Diff[] = [];
  for (const field of fieldsAllowed) {
    const oldVal = current?.[field];
    const newVal = incoming?.[field];
    const write = shouldWrite(oldVal, newVal);
    diffs.push({
      field,
      old: oldVal ?? null,
      new: newVal ?? null,
      action: write ? 'write' : 'skip',
      reason: write ? (isEmpty(oldVal) ? 'db empty' : 'better data policy disabled') : (isEmpty(newVal) ? 'incoming empty' : 'non-empty db'),
    });
  }
  return diffs;
}
