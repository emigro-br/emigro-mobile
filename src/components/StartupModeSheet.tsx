import React from 'react';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Box } from '@/components/ui/box';
import { Pressable } from 'react-native';
import { sessionStore } from '@/stores/SessionStore';
import { useToast, Toast, ToastDescription } from '@/components/ui/toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const StartupModeSheet = ({ isOpen, onClose }: Props) => {
  const current = sessionStore.preferences?.startupMode ?? 'wallet';
  const toast = useToast();

  const selectMode = async (selectedMode: 'wallet' | 'payment') => {
    if (selectedMode !== current) {
      await sessionStore.updateStartupMode(selectedMode);
      const label = selectedMode === 'wallet' ? 'Wallet' : 'Payment';

      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="muted" variant="solid">
            <ToastDescription>
              Startup mode updated
            </ToastDescription>
          </Toast>
        ),
      });
    }

    onClose();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent
        style={{
          backgroundColor: '#0a0a0a',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 12,
          paddingBottom: 32,
        }}
      >
        {/* Close button */}
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 16,
            zIndex: 10,
            width: 34,
            height: 34,
            borderRadius: 16,
            backgroundColor: '#fe0055',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '600' }}>×</Text>
        </Pressable>

        {/* Drag handle */}
        <Box style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 12 }}>
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator
              style={{
                width: 80,
                height: 8,
                borderRadius: 3,
                backgroundColor: '#555',
              }}
            />
          </ActionsheetDragIndicatorWrapper>
        </Box>

        {/* Title */}
        <Text
          className="text-lg font-bold text-center mb-4"
          style={{ color: '#fff' }}
        >
          Select Startup Mode
        </Text>

        {/* Mode options */}
        <VStack space="lg" className="w-full px-4">
          {/* Wallet Option */}
          <Pressable
            onPress={() => selectMode('wallet')}
            style={{
              backgroundColor: '#141414',
              borderColor: current === 'wallet' ? '#fe0055' : '#333',
              borderWidth: 2,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <VStack alignItems="flex-start" space="xs">
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Wallet (default)
              </Text>
              <Text style={{ color: '#aaa', fontSize: 14 }}>
                Launches into your wallet overview with balances and assets.
              </Text>
            </VStack>
          </Pressable>

          {/* Payment Option */}
          <Pressable
            onPress={() => selectMode('payment')}
            style={{
              backgroundColor: '#141414',
              borderColor: current === 'payment' ? '#fe0055' : '#333',
              borderWidth: 2,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 16,
            }}
          >
            <VStack alignItems="flex-start" space="xs">
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Payment (fast screen)
              </Text>
              <Text style={{ color: '#aaa', fontSize: 14 }}>
                Skips wallet and opens fast payment for quicker transfers.
              </Text>
            </VStack>
          </Pressable>
        </VStack>
      </ActionsheetContent>
    </Actionsheet>
  );
};
