import { fireEvent, render, screen } from '@testing-library/react-native';

import { CryptoAsset } from '@/types/assets';

import { AssetListActionSheet } from '../AssetListActionSheet';

// FIXME: gluestack not rendering correctly
describe.skip('AssetListActionSheet component', () => {
  const assets = [CryptoAsset.EURC, CryptoAsset.USDC]; // FIXME: change to Assets[]
  const isOpen = true;
  const onClose = jest.fn();
  const onItemPress = jest.fn();

  beforeEach(() => {
    render(<AssetListActionSheet assets={assets} isOpen={isOpen} onClose={onClose} onItemPress={onItemPress} />);
  });

  it('Should render the action sheet component correctly', () => {
    const actionSheet = screen.getByTestId('asset-list-action-sheet');
    expect(actionSheet).toBeTruthy();
  });

  it('Should render the correct number of assets', () => {
    const assetItems = screen.getAllByTestId('asset-list-item');
    expect(assetItems.length).toBe(assets.length);
  });

  it('Should call onItemPress when an asset item is pressed', () => {
    const assetItem = screen.getByText('USDC');
    fireEvent.press(assetItem);
    expect(onItemPress).toHaveBeenCalledWith('USDC');
  });

  it('Should call onClose when the action sheet is closed', () => {
    const actionSheet = screen.getByTestId('asset-list-action-sheet');
    fireEvent(actionSheet, 'close');
    expect(onClose).toHaveBeenCalled();
  });
});
