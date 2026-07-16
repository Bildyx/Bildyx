// Shared batching helpers for the import engine. Import files can reach
// ~200k rows, so every DB write path must work in bounded chunks: bulk
// statements (createMany / IN-list filters) are capped at CHUNK_SIZE rows,
// and unavoidable per-row statements run PARALLELISM at a time instead of
// paying one sequential network round-trip per row.
export const CHUNK_SIZE = 1000;

// Bounded by Prisma's connection pool and Supabase's pgbouncer pool size
// (15 by default) - 10 keeps headroom for the API server sharing the pooler.
export const PARALLELISM = 10;

export function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

export async function runBatched<T>(
  items: T[],
  fn: (item: T) => Promise<unknown>,
  parallelism: number = PARALLELISM,
): Promise<void> {
  for (const slice of chunk(items, parallelism)) {
    await Promise.all(slice.map(fn));
  }
}
