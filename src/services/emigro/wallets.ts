// src/services/emigro/wallets.ts
import { api } from './api';

/**
 * Create a wallet on a specific chain for the authenticated user.
 * Backend route: POST /wallets/:chainId/create
 */
export async function createWalletOnChain(chainId: string): Promise<void> {
  const client = api();
  await client.post(`/wallets/${chainId}/create`);
}
