import type { ActivityType } from "./activities";

export type Role = "participant" | "leader" | "admin" | "superadmin";

export type Company = {
  id: string; slug: string; name: string; logo_url: string | null;
  primary_color: string; secondary_color: string; accent_color: string;
  timezone: string; consent_text: string; consent_version: string;
  notifications_webhook_url: string | null; allow_photo_avatar: boolean; created_at: Date;
};

export type Campaign = {
  id: string; company_id: string; name: string; theme: string;
  start_date: string; end_date: string; release_time: string;
  makeup_deadline: Date | null; makeup_factor: number; min_days_for_certificate: number;
  opening_message: string | null; opening_video_url: string | null;
  wall_challenge: string | null; wall_voting_deadline: Date | null;
  status: "draft" | "scheduled" | "active" | "closed"; closed_at: Date | null; created_at: Date;
  cipa_approval: string | null;
};

export type CampaignDay = {
  id: string; campaign_id: string; day_index: number; date: string;
  title: string; theme: string; youtube_video_id: string | null; video_duration_s: number | null; video_start_s: number | null; video_end_s: number | null;
  has_wheel: boolean;
};

export type Activity = {
  id: string; campaign_day_id: string; type: ActivityType; config: unknown;
  points_per_item: number; retry_points: number; bonus_max: number; bonus_window_s: number;
};

export type Participant = {
  id: string; company_id: string; campaign_id: string | null; name: string; cpf: string;
  birth_date: string; email: string | null; sector: string; role: Role;
  avatar_config: AvatarConfig | null; avatar_url: string | null;
  pin_hash: string | null; pin_set: boolean; pin_reset_required: boolean;
  failed_logins: number; locked_until: Date | null; session_version: number;
  consent_at: Date | null; first_login_at: Date | null; created_at: Date;
};

export type AvatarGender = "m" | "f";

export type AvatarConfig = {
  style: "adventurer" | "avataaars" | "bottts" | "photo";
  seed: string;
  options: Record<string, string | number | boolean | string[] | undefined>;
  /** Filtra cabelos/barba/acessórios; ausente = todas as opções. */
  gender?: AvatarGender;
  /** Só quando style = "photo" (URL do nosso Storage). */
  photo_url?: string;
};
