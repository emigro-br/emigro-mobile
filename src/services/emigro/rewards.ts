// src/services/emigro/rewards.ts
import { api } from '@/services/emigro/api';
import {
  RewardSummaryResponse,
  RewardLedgerResponse,
  RewardReferralCodeResponse,
  RewardApplyReferralResponse,
  UserRankResponse,
} from '@/services/emigro/types';

export async function getMyRewardSummary(): Promise<RewardSummaryResponse> {
  const res = await api().get('/rewards/me');
  return res.data as RewardSummaryResponse;
}

export async function getMyRewardLedger(params?: { limit?: number; cursor?: string }): Promise<RewardLedgerResponse> {
  const res = await api().get('/rewards/ledger', {
    params: {
      limit: params?.limit,
      cursor: params?.cursor,
    },
  });
  return res.data as RewardLedgerResponse;
}

export async function getMyReferralCode(): Promise<RewardReferralCodeResponse> {
  const res = await api().get('/rewards/referral-code');
  return res.data as RewardReferralCodeResponse;
}

export async function applyReferralCode(code: string): Promise<RewardApplyReferralResponse> {
  const res = await api().post('/rewards/apply-referral', { code });
  return res.data as RewardApplyReferralResponse;
}

export async function getUserRank(userId: string): Promise<UserRankResponse> {
  const res = await api().get('/rewards/rank', { params: { userId } });
  return res.data as UserRankResponse;
}
