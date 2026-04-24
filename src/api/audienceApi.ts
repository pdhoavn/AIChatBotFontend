// Audience and Intent API calls for guest chat
import { fastAPIClient } from "../utils/fastapi-client.js";

export const audienceAPI = {
  getAudiences: () => fastAPIClient.get<Audience[]>("/audiences/target-audience"),
  getIntents: () => fastAPIClient.get<Intent[]>("/intents2"),
};

export interface Audience {
  id: number;
  name: string;
  description: string | null;
}

export interface Intent {
  intent_id: number;
  intent_name: string;
  description: string | null;
  target_audience_id: number;
}
