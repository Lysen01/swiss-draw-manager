const STORAGE_KEY = "swiss-manager-v2";
const LEGACY_STORAGE_KEY = "swiss-manager-v1";
const KYIV_PRESET_VERSION = "kyiv-v1";
const API_BASE_URL_STORAGE_KEY = "arbiter-api-origin";
const AUTH_TOKEN_STORAGE_KEY = "arbiter-auth-token";
const REMOTE_SYNC_DEBOUNCE_MS = 400;
const DEFAULT_TOURNAMENT_COVER_URL = "/assets/default-tournament-cover.png";
const DEFAULT_TIEBREAK_ORDER = ["head_to_head", "buchholz", "solk_plus", "tsolk", "wins"];
const TIEBREAK_OPTIONS = [
  { value: "head_to_head", label: "Особисті зустрічі (H2H)" },
  { value: "buchholz", label: "Buchholz" },
  { value: "solk_plus", label: "SOLK+" },
  { value: "tsolk", label: "TSOLK" },
  { value: "sb", label: "Sonneborn-Berger (SB)" },
  { value: "wins", label: "Кількість перемог (Wins)" },
  { value: "rating", label: "Рейтинг" },
];
const GENDER_OPTIONS = [
  { value: "", label: "Не вказано" },
  { value: "M", label: "М" },
  { value: "F", label: "Ж" },
];
const MAX_TOURNAMENT_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_TOURNAMENT_PHOTO_STORE_BYTES = 1_600_000;
const MAX_BASE_PLAYER_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_BASE_PLAYER_PHOTO_STORE_BYTES = 320_000;
const MAX_CLUB_LOGO_BYTES = 8 * 1024 * 1024;
const MAX_CLUB_LOGO_STORE_BYTES = 260_000;
const MAX_COACH_PHOTO_BYTES = 8 * 1024 * 1024;
const MAX_COACH_PHOTO_STORE_BYTES = 260_000;
const INTERNAL_RATING_K = 10;
const INTERNAL_RATING_DELTA_CAP = 80;
const INTERNAL_RATING_EXPECTED_TABLE = [
  { min: 0, max: 3, betterPercent: 50 },
  { min: 4, max: 10, betterPercent: 51 },
  { min: 11, max: 17, betterPercent: 52 },
  { min: 18, max: 25, betterPercent: 53 },
  { min: 26, max: 32, betterPercent: 54 },
  { min: 33, max: 39, betterPercent: 55 },
  { min: 40, max: 46, betterPercent: 56 },
  { min: 47, max: 53, betterPercent: 57 },
  { min: 54, max: 61, betterPercent: 58 },
  { min: 62, max: 68, betterPercent: 59 },
  { min: 69, max: 76, betterPercent: 60 },
  { min: 77, max: 83, betterPercent: 61 },
  { min: 84, max: 91, betterPercent: 62 },
  { min: 92, max: 98, betterPercent: 63 },
  { min: 99, max: 106, betterPercent: 64 },
  { min: 107, max: 113, betterPercent: 65 },
  { min: 114, max: 121, betterPercent: 66 },
  { min: 122, max: 129, betterPercent: 67 },
  { min: 130, max: 137, betterPercent: 68 },
  { min: 138, max: 145, betterPercent: 69 },
  { min: 146, max: 153, betterPercent: 70 },
  { min: 154, max: 162, betterPercent: 71 },
  { min: 163, max: 170, betterPercent: 72 },
  { min: 171, max: 179, betterPercent: 73 },
  { min: 180, max: 188, betterPercent: 74 },
  { min: 189, max: 197, betterPercent: 75 },
  { min: 198, max: 206, betterPercent: 76 },
  { min: 207, max: 215, betterPercent: 77 },
  { min: 216, max: 225, betterPercent: 78 },
  { min: 226, max: 235, betterPercent: 79 },
  { min: 236, max: 245, betterPercent: 80 },
  { min: 246, max: 256, betterPercent: 81 },
  { min: 257, max: 267, betterPercent: 82 },
  { min: 268, max: 278, betterPercent: 83 },
  { min: 279, max: 290, betterPercent: 84 },
  { min: 291, max: 302, betterPercent: 85 },
  { min: 303, max: 315, betterPercent: 86 },
  { min: 316, max: 328, betterPercent: 87 },
  { min: 329, max: 344, betterPercent: 88 },
  { min: 345, max: 357, betterPercent: 89 },
  { min: 358, max: 374, betterPercent: 90 },
  { min: 375, max: 391, betterPercent: 91 },
  { min: 392, max: 411, betterPercent: 92 },
  { min: 412, max: 432, betterPercent: 93 },
  { min: 433, max: 456, betterPercent: 94 },
  { min: 457, max: 484, betterPercent: 95 },
  { min: 485, max: 517, betterPercent: 96 },
  { min: 518, max: 559, betterPercent: 97 },
  { min: 560, max: 619, betterPercent: 98 },
  { min: 620, max: 735, betterPercent: 99 },
  { min: 736, max: Number.POSITIVE_INFINITY, betterPercent: 100 },
];
