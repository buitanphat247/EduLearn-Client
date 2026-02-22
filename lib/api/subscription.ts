import api from "@/app/config/api";

export interface PlanFeatureLimit {
  id: number;
  plan_id: number;
  feature_code: string;
  limit_value: number;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  limits?: PlanFeatureLimit[];
}

export interface UserSubscription {
  id: number;
  user_id: number;
  plan_id: number;
  start_at: string;
  end_at: string;
  status: "active" | "expired" | "cancelled";
  plan?: SubscriptionPlan;
}

export interface UsageStat {
  id: number;
  user_id: number;
  feature_code: string;
  usage_date: string;
  usage_count: number;
  user?: {
    username: string;
    email: string;
  };
}

/**
 * Helper to strictly extract array from wrapped response
 */
const extractArray = <T>(response: any): T[] => {
  const body = response.data;
  if (!body) return [];

  // If wrapped in { status, data, ... }
  if (body.status !== undefined && body.data !== undefined) {
    return Array.isArray(body.data) ? body.data : [];
  }

  // If direct array
  return Array.isArray(body) ? body : [];
};

/**
 * Helper to strictly extract object from wrapped response
 */
const extractObject = <T>(response: any): T | null => {
  const body = response.data;
  if (!body) return null;

  if (body.status !== undefined && body.data !== undefined) {
    return body.data;
  }

  return body;
};

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  const response = await api.get("/subscription/plans");
  return extractArray<SubscriptionPlan>(response);
};

export const getSubscriptionStatus = async (): Promise<{ isPro: boolean; subscription: UserSubscription | null }> => {
  const response = await api.get("/subscription/status");
  return extractObject<{ isPro: boolean; subscription: UserSubscription | null }>(response) || { isPro: false, subscription: null };
};

export type FeatureUsageStatus = { allowed: boolean; currentCount: number; limit: number };

export const getUsageStatusForFeature = async (featureCode: string): Promise<FeatureUsageStatus> => {
  const response = await api.get("/subscription/usage-status", { params: { featureCode } });
  const raw = extractObject<FeatureUsageStatus>(response);
  return raw ?? { allowed: false, currentCount: 0, limit: 0 };
};

export const adminSubscribe = async (userId: number, planId: number): Promise<UserSubscription> => {
  const response = await api.post("/subscription/admin/subscribe", { userId, planId });
  return extractObject<UserSubscription>(response)!;
};

export const adminSubscribeByEmail = async (email: string, planId: number): Promise<UserSubscription> => {
  const response = await api.post("/subscription/admin/subscribe-by-email", { email, planId });
  return extractObject<UserSubscription>(response)!;
};

export const getUsageStats = async (featureCode?: string): Promise<UsageStat[]> => {
  const response = await api.get("/subscription/admin/usage-stats", { params: { featureCode } });
  return extractArray<UsageStat>(response);
};

export const getAllUserSubscriptions = async (page: number = 1, limit: number = 20, search?: string): Promise<{ data: any[]; total: number }> => {
  const response = await api.get("/subscription/admin/users", { params: { page, limit, search } });
  return extractObject<{ data: any[]; total: number }>(response) || { data: [], total: 0 };
};

export const cancelUserSubscription = async (id: number): Promise<void> => {
  await api.delete(`/subscription/admin/user-subscriptions/${id}`);
};

export const createSubscriptionPlan = async (data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await api.post("/subscription/plans", data);
  return extractObject<SubscriptionPlan>(response)!;
};

export const updateSubscriptionPlan = async (id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> => {
  const response = await api.patch(`/subscription/plans/${id}`, data);
  return extractObject<SubscriptionPlan>(response)!;
};

export const deleteSubscriptionPlan = async (id: number): Promise<void> => {
  await api.delete(`/subscription/plans/${id}`);
};

export const getPlanLimits = async (planId: number): Promise<PlanFeatureLimit[]> => {
  const response = await api.get(`/subscription/admin/plans/${planId}/limits`);
  return extractArray<PlanFeatureLimit>(response);
};

export const updatePlanLimit = async (planId: number, feature_code: string, limit_value: number): Promise<PlanFeatureLimit> => {
  const response = await api.post(`/subscription/admin/plans/${planId}/limits`, { feature_code, limit_value });
  return extractObject<PlanFeatureLimit>(response)!;
};

export interface AiUsageLog {
  id: string;
  user_id: string;
  feature_code: string;
  model_name: string;
  provider: string;
  total_tokens: number;
  latency_ms?: number;
  created_at: string;
  user?: {
    username: string;
    email: string;
  };
}

export interface AiUsageStats {
  logs: AiUsageLog[];
  total: number;
  page: number;
  limit: number;
  stats: {
    feature_code: string;
    model_name: string;
    provider: string;
    count: number;
  }[];
}

export const getGlobalAiUsageStats = async (
  startDate?: string,
  endDate?: string,
  featureCode?: string,
  page: number = 1,
  limit: number = 50,
): Promise<AiUsageStats> => {
  const response = await api.get("/subscription/admin/ai-usage-stats", {
    params: { startDate, endDate, featureCode, page, limit },
  });
  const raw = extractObject<AiUsageStats>(response);
  return raw
    ? { logs: raw.logs ?? [], total: raw.total ?? 0, page: raw.page ?? 1, limit: raw.limit ?? 50, stats: raw.stats ?? [] }
    : { logs: [], total: 0, page: 1, limit: 50, stats: [] };
};
