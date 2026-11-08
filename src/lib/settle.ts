import { unstable_rethrow } from "next/navigation";

export async function settle<T>(load: () => Promise<T>) {
  try {
    const data = await load();
    return { ok: true as const, data };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false as const, error };
  }
}
