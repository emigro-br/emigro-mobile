import React from 'react';
import { Image, Text as RNText, TouchableOpacity, Pressable } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';
import { ScrollView } from '@/components/ui/scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useUserRewardPoints } from '@/hooks/useUserRewardPoints';

import { useEffect, useState } from 'react';
import { getMyReferralCode } from '@/services/emigro/rewards';
import { RewardPointsHistorySheet } from '@/components/rewards/RewardPointsHistorySheet';

const EmiPointsScreen = observer(() => {
  const insets = useSafeAreaInsets();
  const { points, loading } = useUserRewardPoints();

  const [referralCode, setReferralCode] = useState<string>('…');
  const [referralLoading, setReferralLoading] = useState<boolean>(true);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getMyReferralCode();
        if (mounted) setReferralCode(res?.code || 'N/A');
      } catch {
        if (mounted) setReferralCode('N/A');
      } finally {
        if (mounted) setReferralLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  const copyReferral = async () => {
    await Clipboard.setStringAsync(referralCode);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        style={{ paddingTop: insets.top, backgroundColor: '#111111' }} // gray background
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center', // vertical center
          alignItems: 'center',     // horizontal center
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
      >
        <VStack space="sm" className="w-full" style={{ maxWidth: 520, alignItems: 'center' }}>

          {/* ===== Header: icon + EmiPoints (centered) ===== */}
          <Box
            className="flex-row items-center"
            style={{ alignItems: 'center', justifyContent: 'center', marginTop: 16 }}
          >
            <Image
              source={require('@/assets/images/icons/emipoint-icon-red.png')}
              style={{ width: 32, height: 32, marginRight: 10, tintColor: '#FFFFFF' }} // white like menu
              resizeMode="contain"
            />
            {/* Use RNText to ensure fontSize applies exactly */}
            <RNText
              allowFontScaling={false}
              style={{ color: '#FFFFFF', fontSize: 28, lineHeight: 28 }}
            >
              <RNText style={{ fontWeight: '800' }}>Emi</RNText>
              <RNText>Points</RNText>
            </RNText>
          </Box>

          {/* ===== Subheading: REWARDS ===== */}
          <RNText
            allowFontScaling={false}
            style={{
              color: '#DDDDDD',
              fontSize: 14,
              letterSpacing: 6,
              fontWeight: '900',
              marginTop: -6, // tuck closer under EmiPoints
              marginBottom: 20,
            }}
          >
            REWARDS
          </RNText>

          {/* ===== Points balance card ===== */}
          <Box className="rounded-2xl w-full" style={{ backgroundColor: '#2e2e2e' }}>
            <VStack space="md" className="p-5" style={{ alignItems: 'center' }}>
              <RNText allowFontScaling={false} style={{ color: '#AAAAAA', fontSize: 12, marginBottom: 6 }}>
                Your balance
              </RNText>
              <RNText allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 44, fontWeight: '800', lineHeight: 52 }}>
                {loading ? '…' : `${(points ?? 0).toFixed(2)} EP`}
              </RNText>
              <RNText allowFontScaling={false} style={{ color: '#BBBBBB', fontSize: 12, marginTop: 4 }}>
                EP = EmiPoints
              </RNText>

			  {/* ===== NEW: View history button (plain Pressable for consistent colors) ===== */}
			  <Pressable
			    onPress={() => setHistoryOpen(true)}
			    style={{
			      marginTop: 10,
			      backgroundColor: '#fe0055',
			      paddingVertical: 10,
			      paddingHorizontal: 18,
			      borderRadius: 8,
			    }}
			  >
			    <RNText
			      allowFontScaling={false}
			      style={{ color: '#FFFFFF', fontWeight: '800' }}
			    >
			      View history
			    </RNText>
			  </Pressable>

            </VStack>
          </Box>

          {/* ===== Referral system (placeholder, coming soon) ===== */}
          <Box className="rounded-2xl w-full" style={{ backgroundColor: '#2e2e2e' }}>
            <VStack className="p-5" space="md" style={{ alignItems: 'center' }}>
              <RNText allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                Refer & earn
              </RNText>
              <RNText allowFontScaling={false} style={{ color: '#CCCCCC', textAlign: 'center' }}>
                Invite friends and earn <RNText style={{ fontWeight: '800', color: '#FFFFFF' }}>10%</RNText> of their EmiPoints.
              </RNText>

              {/* Referral code row */}
              <Box
                className="w-full flex-row items-center justify-between rounded-xl"
                style={{ backgroundColor: '#1b1b1b', paddingVertical: 12, paddingHorizontal: 14, marginTop: 6 }}
              >
                <RNText allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 16, letterSpacing: 1 }}>
                  {referralLoading ? '…' : referralCode}
                </RNText>

                <TouchableOpacity onPress={copyReferral} activeOpacity={0.8}>
                  <Box
                    className="rounded-full items-center justify-center"
                    style={{ backgroundColor: '#fe0055', paddingVertical: 8, paddingHorizontal: 14 }}
                  >
                    <RNText allowFontScaling={false} style={{ color: '#FFFFFF', fontWeight: '700' }}>
                      Copy
                    </RNText>
                  </Box>
                </TouchableOpacity>
              </Box>
            </VStack>
          </Box>

          {/* ===== Current rule (simple system now) ===== */}
          <Box className="rounded-2xl w-full" style={{ backgroundColor: '#2e2e2e' }}>
            <VStack className="p-5" space="xs" style={{ alignItems: 'center' }}>
              <RNText
                allowFontScaling={false}
                style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 6 }}
              >
                How points are earned
              </RNText>

              <RNText
                allowFontScaling={false}
                style={{ color: '#DDDDDD', fontSize: 16, textAlign: 'center' }}
              >
                <RNText style={{ fontWeight: '800' }}>1 USD paid in Pix</RNText>{' '}
                = <RNText style={{ fontWeight: '800' }}>10 EP</RNText>
              </RNText>

              <RNText
                allowFontScaling={false}
                style={{ color: '#BBBBBB', fontSize: 12, marginTop: 8, textAlign: 'center' }}
              >
                Any stablecoin or token is eligible — rewards are calculated from the USD equivalent at payment time.
              </RNText>
            </VStack>
          </Box>

          {/* ===== Coming soon / To be announced ===== */}
          <Box className="rounded-2xl w-full" style={{ backgroundColor: '#2e2e2e' }}>
            <VStack space="md" className="p-5" style={{ alignItems: 'center' }}>
              <RNText allowFontScaling={false} style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
                Coming soon
              </RNText>
              <RNText allowFontScaling={false} style={{ color: '#CCCCCC', textAlign: 'center' }}>
                Future features will expand EmiPoints with partner rewards, tiers multipliers, exclusive perks, and special redemptions —{' '}
                <RNText style={{ fontWeight: '700' }}>more details TBA (to be announced)</RNText>.
              </RNText>
            </VStack>
          </Box>

          {/* subtle footer */}
          <RNText allowFontScaling={false} style={{ color: '#6F6F6F', fontSize: 12, marginTop: 8 }}>
            v1 — Rewards in development
          </RNText>
        </VStack>
      </ScrollView>

      {/* ===== NEW: Points history modal ===== */}
      <RewardPointsHistorySheet
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </>
  );

});

export default EmiPointsScreen;
