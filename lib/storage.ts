import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage com buckets prefixados (padrão "sipatgo-public" e
 * "sipatgo-private") para não colidir com buckets de outros produtos.
 */
let client: SupabaseClient | null = null;
const ensured = new Set<string>();

export function storageEnabled() {
  return Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY));
}

function supa(): SupabaseClient {
  if (!storageEnabled()) throw new Error("Storage não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)");
  if (!client) {
    client = createClient((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)!, (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export type BucketKind = "public" | "private";

export function bucketName(kind: BucketKind) {
  return `${process.env.SUPABASE_BUCKET_PREFIX || "sipatgo"}-${kind}`;
}

async function ensureBucket(kind: BucketKind) {
  const name = bucketName(kind);
  if (ensured.has(name)) return name;
  const s = supa();
  const { data } = await s.storage.getBucket(name);
  if (!data) {
    await s.storage.createBucket(name, { public: kind === "public", fileSizeLimit: 10 * 1024 * 1024 });
  }
  ensured.add(name);
  return name;
}

export async function uploadFile(kind: BucketKind, path: string, body: ArrayBuffer | Buffer | Blob, contentType: string) {
  const bucket = await ensureBucket(kind);
  const { error } = await supa().storage.from(bucket).upload(path, body, { contentType, upsert: true });
  if (error) throw new Error(`Falha no upload: ${error.message}`);
  return kind === "public" ? publicUrl(path) : path;
}

export function publicUrl(path: string) {
  return `${(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)}/storage/v1/object/public/${bucketName("public")}/${path}`;
}

export async function signedUrls(paths: string[], expiresIn = 3600): Promise<Record<string, string>> {
  if (!paths.length || !storageEnabled()) return {};
  const { data } = await supa().storage.from(bucketName("private")).createSignedUrls(paths, expiresIn);
  const out: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}

export async function deleteFile(kind: BucketKind, path: string) {
  if (!storageEnabled()) return;
  await supa().storage.from(bucketName(kind)).remove([path]);
}
