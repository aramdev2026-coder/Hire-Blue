import { apiFetch } from '../api';
import { API_ROUTES } from '../api/routes';

export async function fetchFunnelData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.FUNNEL);
}

export async function fetchLeaderboardData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.SUB_ADMIN_LEADERBOARD);
}

export async function fetchSourceBreakdownData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.SOURCE_BREAKDOWN);
}

export async function fetchDistrictDemandData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.DISTRICT_DEMAND);
}

export async function fetchTimeToPlacementData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.TIME_TO_PLACEMENT);
}

export async function fetchPlacementRateData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.PLACEMENT_RATE);
}

export async function fetchAgingData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.AGING);
}

export async function fetchActivityLogs() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.ACTIVITY_LOGS);
}

export async function fetchSummaryData() {
  return apiFetch(API_ROUTES.SUPER_ADMIN.ANALYTICS.SUMMARY);
}
