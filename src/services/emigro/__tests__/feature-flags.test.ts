import axios, { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { api } from '../api';
import { FeatureFlags, getAllFlags } from '../feature-flags';

jest.mock('../api', () => ({
  api: jest.fn(),
}));

describe('getAllFlags', () => {
  let mock: MockAdapter;
  let instance: AxiosInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    instance = axios.create();
    mock = new MockAdapter(instance, { onNoMatch: 'throwException' });
    (api as jest.Mock).mockReturnValue(instance);
  });

  it('should fetch and return all feature flags', async () => {
    const mockResponse: FeatureFlags = {
      flag1: {
        allowUsers: ['user1', 'user2'],
      },
      flag2: {
        allowUsers: ['user3', 'user4'],
      },
    };
    const mockAxiosGet = jest.spyOn(instance, 'get');
    mock.onGet('/feature-flags').reply(200, mockResponse);

    const result = await getAllFlags();

    expect(mockAxiosGet).toHaveBeenCalledWith('/feature-flags');
    expect(result).toEqual(mockResponse);
  });

  it('should throw an error if the API call fails', async () => {
    const mockError = new Error('API error');

    const mockAxiosGet = jest.spyOn(instance, 'get').mockRejectedValue(mockError);

    await expect(getAllFlags()).rejects.toThrow('API error');
    expect(mockAxiosGet).toHaveBeenCalledWith('/feature-flags');
  });
});
