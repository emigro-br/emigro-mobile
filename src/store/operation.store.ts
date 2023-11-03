import { create } from 'zustand';
import { IOperation } from '@/types/IOperation';
import { OperationType } from '@constants/constants';

interface IOperationStore {
  operation: IOperation;
  setOperationType: (operationType: OperationType) => void;
}

export const useOperationStore = create<IOperationStore>((set) => ({
  operation: {
    type: undefined,
    assetCode: undefined,
  },
  setOperationType: (operationType: OperationType) => set(state => ({ 
    operation: {
      ...state.operation,
      type: operationType,
    }
    })),
}));