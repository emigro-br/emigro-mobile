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

import { Asset, CryptoOrFiat } from '@/types/assets';

import { AssetImage } from './AssetImage';

type Props = {
  assets: Asset[];
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
            <ActionsheetItem key={asset.code} onPress={() => onItemPress(asset.code as CryptoOrFiat)}>
              <AssetImage asset={asset} size="xs" />
              <ActionsheetItemText>{asset.name}</ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
