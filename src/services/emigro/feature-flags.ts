import { api } from './api';

export type FeatureFlags = {
  [key: string]: {
    allowUsers: string[];
  };
};

export const getAllFlags = async (): Promise<FeatureFlags> => {
  const res = await api().get('/feature-flags');
  return res.data;
};
