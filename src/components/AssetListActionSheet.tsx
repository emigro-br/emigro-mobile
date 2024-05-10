import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
  View,
} from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';
import { labelFor } from '@/utils/assets';

import { AssetAvatar } from './AssetAvatar';

type Props = {
  assets: CryptoOrFiat[];
  isOpen: boolean;
  onClose: () => void;
  onItemPress: (asset: CryptoOrFiat) => void;
};

export const AssetListActionSheet = ({ assets, isOpen, onClose, onItemPress }: Props) => {
  return (
    <View testID="asset-list-action-sheet">
      <Actionsheet isOpen={isOpen} onClose={onClose} zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent h="$72" zIndex={999}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {assets.map((asset) => (
            <ActionsheetItem key={asset} onPress={() => onItemPress(asset)}>
              <AssetAvatar asset={asset} size="sm" />
              <ActionsheetItemText>{labelFor(asset)}</ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
