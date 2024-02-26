import { makeAutoObservable } from 'mobx';

import { IOperation } from '@/types/IOperation';

import { OperationType } from '@constants/constants';

export class OperationStore {
  operation: IOperation = {
    type: undefined,
  };

  constructor() {
    makeAutoObservable(this);
  }

  setOperationType(operationType: OperationType) {
    this.operation.type = operationType;
  }
}

export const operationStore = new OperationStore();
