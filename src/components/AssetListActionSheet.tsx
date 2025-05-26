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
  console.log('[AssetListActionSheet] Rendered');
  console.log('[AssetListActionSheet] isOpen:', isOpen);
  console.log('[AssetListActionSheet] assets:', assets);

  return (
    <View testID="asset-list-action-sheet">
      <Actionsheet isOpen={isOpen} onClose={() => {
        console.log('[AssetListActionSheet] onClose triggered');
        onClose();
      }} className="z-999">
        <ActionsheetBackdrop />
        <ActionsheetContent className="h-72 z-999">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          {assets.map((asset) => {
            console.log('[AssetListActionSheet] Rendering asset item:', asset.code);
            return (
              <ActionsheetItem
                key={asset.code}
                onPress={() => {
                  console.log('[AssetListActionSheet] onItemPress:', asset.code);
                  onItemPress(asset.code as CryptoOrFiat);
                }}
              >
                <AssetImage asset={asset} size="xs" />
                <ActionsheetItemText size="lg" className="ml-2">
                  {asset.name}
                </ActionsheetItemText>
              </ActionsheetItem>
            );
          })}
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
