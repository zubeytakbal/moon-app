import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

/**
 * Sayfa önbelleği R2'de tutulur; süresi dolan sayfalar (cacheLife) Durable Object kuyruğuyla
 * arka planda yenilenir. revalidateTag/revalidatePath kullanılmadığı için etiket önbelleği gerekmez.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
});
