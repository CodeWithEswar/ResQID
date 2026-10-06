export type Role = "pending" | "rescuer" | "verifier" | "admin";
export type AvatarKey =
  | "scout"
  | "tech"
  | "pilot"
  | "medic"
  | "ranger"
  | "lead"
  | "cadet"
  | "analyst"
  | "diver"
  | "spark"
  | "short-hair"
  | "curly-hair"
  | "tied-hair";
export type AvatarColor =
  | "violet"
  | "cyan"
  | "blue"
  | "amber"
  | "emerald"
  | "coral"
  | "rose"
  | "indigo"
  | "lime"
  | "silver";
export type AvatarShape =
  | "squircle"
  | "circle"
  | "hexagon"
  | "shield"
  | "diamond"
  | "octagon"
  | "rounded-square"
  | "pentagon"
  | "star";
export type AvatarStyle = "3d" | "2d";
export type Profile = {
  id: string;
  display_name: string;
  email?: string;
  avatar_url?: string;
  role: Role;
  created_at?: string;
  avatar_key?: AvatarKey;
  avatar_color?: AvatarColor;
  avatar_shape?: AvatarShape;
  avatar_style?: AvatarStyle;
};
export type TeamShape =
  | "shield"
  | "hexagon"
  | "diamond"
  | "circle"
  | "crest"
  | "rounded-square"
  | "pentagon"
  | "star";
export type TeamStyle = "3d" | "2d";
export type TeamIcon =
  "shield" | "search" | "users" | "radio" | "compass" | "pulse";
export type TeamCrest = {
  name: string;
  shape: TeamShape;
  style: TeamStyle;
  icon: TeamIcon;
  color: AvatarColor;
};
export type CaseStatus =
  "pending" | "urgent" | "ongoing" | "completed" | "closed";
export type Person = {
  id: string;
  name: string;
  age: number | null;
  last_seen: string;
  notes: string;
  consent_basis: string;
  status: CaseStatus;
  created_at: string;
};
export type Reference = {
  id: string;
  modality: "face" | "ear";
  model: string;
  photo_url: string;
  created_at: string;
};
export type PersonDetail = Person & { references: Reference[] };
export type Review = {
  id: string;
  person_id: string;
  search_id?: string;
  score: number;
  components: Record<string, number>;
  thresholds?: Record<string, unknown>;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  persons: Person | null;
  search_photo_url?: string | null;
  case_photo_url?: string | null;
};
export type Candidate = {
  id: string;
  person_id: string;
  score: number;
  components: Record<string, number>;
  status: "pending";
  person: Person | null;
};
export type SearchResult = {
  candidates: Candidate[];
  message: string;
  score_is_probability: false;
  thresholds: Record<string, number>;
  warnings?: string[];
  calibration: string;
};
export type DetectedFace = {
  index: number;
  box: [number, number, number, number];
  confidence: number;
  quality?: {
    brightness: number;
    contrast: number;
    laplacian_variance: number;
    face_width: number;
    face_height: number;
  };
  usable: boolean;
  issues: string[];
};
export type DetectionFrame = {
  image: string;
  annotated_image: string;
  width: number;
  height: number;
  mime_type: string;
};
export type FaceDetection = {
  width: number;
  height: number;
  faces: DetectedFace[];
  selection_required: boolean;
  detector: string;
  detector_version: string;
  processing_ms?: number;
  frame?: DetectionFrame | null;
};
export type LiveFaceDetection = FaceDetection & {
  sequence: number;
  captured_at_ms: number | null;
};
export type VideoFaceFrame = FaceDetection & {
  frame_index: number;
  timestamp_seconds: number;
};
export type VideoFaceDetection = {
  duration_seconds: number;
  fps: number;
  total_frames: number;
  sampled_frames: number;
  frames_with_faces: number;
  sampling_interval_seconds: number;
  frames: VideoFaceFrame[];
  detector: string;
  detector_version: string;
  processing_ms: number;
  message: string;
  warnings: string[];
};
