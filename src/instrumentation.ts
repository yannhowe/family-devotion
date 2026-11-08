export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  try {
    const { ensureDatabase } = await import("./db/ensure");
    await ensureDatabase();
  } catch (error) {
    console.error(
      "Family Devotion will try the database again on the next request.",
      error instanceof Error ? error.message : error,
    );
  }
}
