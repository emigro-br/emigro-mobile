import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from '@/components/ui/actionsheet';
import { View } from '@/components/ui/view';
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
      <Actionsheet isOpen={isOpen} onClose={onClose} className="z-999">
        <ActionsheetBackdrop />
        <ActionsheetContent className="h-72 z-999">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {assets.map((asset) => (
            <ActionsheetItem key={asset.code} onPress={() => onItemPress(asset.code as CryptoOrFiat)}>
              <AssetImage asset={asset} size="xs" />
              <ActionsheetItemText size="lg" className="ml-2">
                {asset.name}
              </ActionsheetItemText>
            </ActionsheetItem>
          ))}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
