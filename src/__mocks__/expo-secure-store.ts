const inMemoryStorage: Record<string, string> = {};

export const setItemAsync = jest.fn(async (key: string, value: string) => {
  inMemoryStorage[key] = value;
});

export const getItemAsync = jest.fn(async (key: string) => {
  return inMemoryStorage[key];
});

export const deleteItemAsync = jest.fn(async (key: string) => {
  delete inMemoryStorage[key];
});

export const clear = jest.fn(() => {
  for (const key in inMemoryStorage) {
    delete inMemoryStorage[key];
  }
});
