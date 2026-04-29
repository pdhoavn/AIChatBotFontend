// Audience and Intent API calls for guest chat
import { fastAPIClient } from "../utils/fastapi-client.js";

// Map audience name (from API) to code (for /knowledge/intentbyid)
export const AUDIENCE_CODE_MAP: Record<string, string> = {
  "Viên chức/Người lao động": "CANBO",
  "Viên chức / Người lao động": "CANBO",
  "Sinh viên": "SINHVIEN",
  "Phụ huynh": "PHUHUYNH",
  "Phụ huynh / Bên liên quan": "PHUHUYNH",
  "Tuyển sinh": "TUYENSINH",
  officer: "CANBO",
  student: "SINHVIEN",
  parent: "PHUHUYNH",
  admission: "TUYENSINH",
  CANBO: "CANBO",
  SINHVIEN: "SINHVIEN",
  PHUHUYNH: "PHUHUYNH",
  TUYENSINH: "TUYENSINH",
};

export interface Audience {
  id: number;
  name: string;
  description: string | null;
  code?: string | null;
  audience_code?: string | null;
  value?: string | null;
  slug?: string | null;
}

function normalizeAudienceKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const NORMALIZED_AUDIENCE_CODE_MAP = Object.fromEntries(
  Object.entries(AUDIENCE_CODE_MAP).map(([key, value]) => [
    normalizeAudienceKey(key),
    value,
  ])
) as Record<string, string>;

export function resolveAudienceCode(
  audience?: Audience | string | null
): string | null {
  if (!audience) return null;

  if (typeof audience === "string") {
    return (
      AUDIENCE_CODE_MAP[audience] ||
      NORMALIZED_AUDIENCE_CODE_MAP[normalizeAudienceKey(audience)] ||
      null
    );
  }

  const candidates = [
    audience.code,
    audience.audience_code,
    audience.value,
    audience.slug,
    audience.name,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const resolved =
      AUDIENCE_CODE_MAP[candidate] ||
      NORMALIZED_AUDIENCE_CODE_MAP[normalizeAudienceKey(candidate)];

    if (resolved) {
      return resolved;
    }
  }

  return null;
}

export const audienceAPI = {
  getAudiences: () => fastAPIClient.get<Audience[]>("/audiences/target-audience"),
  getIntentsByAudience: (code: string) =>
    fastAPIClient.get<IntentKB[]>(`/knowledge/intentbyid?target_audience=${code}`),
  getSuggestionQuestions: (targetAudienceId: number, intentId = 0) =>
    fastAPIClient.get<unknown>(
      `/question/suggestions?target_audience_id=${targetAudienceId}&intent_id=${intentId}`
    ),
};

// Intent with knowledge base doc (from /knowledge/intentbyid)
export interface IntentKB {
  intent_id: number;
  intent_name: string;
  description: string | null;
  target_audience_id?: number | null;
}
