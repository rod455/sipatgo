import { publicUrl, storageEnabled } from "./storage";
import type { Company } from "./types";

/** Pasta pública das fotos de avatar de um participante. */
export function avatarPhotoPrefix(participantId: string) {
  return storageEnabled() ? publicUrl(`avatars/${participantId}/`) : null;
}

export function photoAvatarAllowed(company: Pick<Company, "allow_photo_avatar">) {
  return Boolean(company.allow_photo_avatar) && storageEnabled();
}
