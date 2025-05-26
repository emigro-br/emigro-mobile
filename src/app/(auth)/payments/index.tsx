import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { QrCodeIcon, HandCoinsIcon } from 'lucide-react-native';

import { AssetListActionSheet } from '@/components/AssetListActionSheet';
import { EmigroHeader } from '@/components/Header';
import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { sessionStore } from '@/stores/SessionStore';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import PixIcon from '@/assets/icons/pix-icon.png'; // ✅ Your image icon

export const Payments = () => {
  const router = useRouter();
  const [assetListOpen, setAssetListOpen] = useState(false);
  const walletId = sessionStore.session?.walletId;
  const { balances } = useWalletBalances(walletId);

  const PaymentOption = ({
    title,
    subtitle,
    icon,
    onPress,
  }: {
    title: string;
    subtitle: string;
    icon: any; // Accepts image or component
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#2e2e2e',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        height: 80,
      }}
      activeOpacity={0.9}
    >
      <View
        style={{
          backgroundColor: '#FF006A',
          padding: 10,
          borderRadius: 999,
          marginRight: 16,
          width: 40,
          height: 40,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {typeof icon === 'function' ? (
          icon({ size: 24, color: '#fff' })
        ) : (
          <Image
            source={icon}
            style={{ width: 24, height: 24, tintColor: '#fff', resizeMode: 'contain' }}
          />
        )}
      </View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{title}</Text>
        <Text style={{ color: '#ccc', fontSize: 13, marginTop: 4 }}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Payments', header: () => <EmigroHeader /> }} />
      <Box className="flex-1 bg-black px-4 pt-6">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
        >
		<View style={{ alignItems: 'center', marginTop: 12, marginBottom: 8 }}>
		  <Heading size="2xl" className="text-white" style={{ textAlign: 'center' }}>
		    Pick Your Payment Method
		  </Heading>
		  <Text size="md" color="textSecondary" style={{ textAlign: 'center', marginTop: 4 }}>
		    Choose how you’d like to send or receive
		  </Text>
		</View>


          <View style={{ marginTop: 32 }}>
            <PaymentOption
              icon={(props) => <QrCodeIcon {...props} />}
              title="Scan to Pay"
              subtitle="Quick QR scan to complete your payment."
              onPress={() => router.push('/payments/scan')}
            />
            <PaymentOption
              icon={(props) => <HandCoinsIcon {...props} />}
              title="Request Payment"
              subtitle="Generate a code and receive payments easily"
              onPress={() => setAssetListOpen(true)}
            />
            <PaymentOption
              icon={PixIcon}
              title="Pix Copia e Cola"
              subtitle="Paste a PIX code to make a payment instantly"
              onPress={() => router.push('/payments/pix/copia-e-cola')}
            />
          </View>
        </ScrollView>

        <AssetListActionSheet
          assets={balances}
          isOpen={assetListOpen}
          onClose={() => setAssetListOpen(false)}
          onItemPress={(asset) => {
            setAssetListOpen(false);
            router.push({
              pathname: '/payments/request',
              params: { asset: JSON.stringify(asset) },
            });
          }}
        />
      </Box>
    </>
  );
};

export default Payments;
