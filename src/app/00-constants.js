const STORAGE_KEY = "swiss-manager-v2";
const LEGACY_STORAGE_KEY = "swiss-manager-v1";
const KYIV_PRESET_VERSION = "kyiv-v1";
const API_BASE_URL_STORAGE_KEY = "arbiter-api-origin";
const REMOTE_SYNC_DEBOUNCE_MS = 400;
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
const MAX_TOURNAMENT_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_TOURNAMENT_PHOTO_STORE_BYTES = 1_600_000;
const MAX_BASE_PLAYER_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_BASE_PLAYER_PHOTO_STORE_BYTES = 320_000;
