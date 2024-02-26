import { OperationType } from '@constants/constants';

import { OperationStore } from '../OperationStore';

describe('OperationStore', () => {
  let operationStore: OperationStore;

  beforeEach(() => {
    operationStore = new OperationStore();
  });

  it('should set operation type', () => {
    const operationType: OperationType = OperationType.DEPOSIT;
    operationStore.setOperationType(operationType);
    expect(operationStore.operation.type).toBe(operationType);
  });
});
