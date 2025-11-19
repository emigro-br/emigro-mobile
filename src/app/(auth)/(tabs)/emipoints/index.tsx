import React, { useEffect, useState, memo } from 'react';
import { Image, Text as RNText, TouchableOpacity, Pressable, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useUserRewardPoints } from '@/hooks/useUserRewardPoints';
import { getMyReferralCode } from '@/services/emigro/rewards';
import { RewardPointsHistorySheet } from '@/components/rewards/RewardPointsHistorySheet';

// ✅ Lucide icons (modern, minimal)
import {
  Wallet,
  Gift,
  Users,
  Link,
  ShoppingBag,
  Coins,
  Zap,
  Star,
  Layers,
  Compass,
  Infinity,
  Trophy,
  Building2,
} from 'lucide-react-native';

/* ---------- colors ---------- */
const COLORS = {
  bg: '#111111',
  card: '#2e2e2e',
  surface: '#1b1b1b',
  text: '#FFFFFF',
  textSub: '#DDDDDD',
  textMuted: '#BBBBBB',
  brand: '#fe0055',
  outline: '#2a2a2a',
  pill: '#2a2a2a',
};
const RADIUS = 16;

/* ---------- reusable components ---------- */
const SectionTitle = ({ children, subtitle }: { children: React.ReactNode; subtitle?: string }) => (
  <VStack space="xs" className="w-full" style={{ marginTop: 8, marginBottom: 8 }}>
    <RNText allowFontScaling={false} style={{ color: COLORS.text, fontSize: 18, fontWeight: '800' }}>
      {children}
    </RNText>
    {subtitle ? (
      <RNText allowFontScaling={false} style={{ color: COLORS.textMuted, fontSize: 12 }}>
        {subtitle}
      </RNText>
    ) : null}
  </VStack>
);

type TileProps = {
  label: string;
  caption?: string;
  soon?: boolean;
  Icon: any;
};

const FeatureTile = memo(({ label, caption, soon, Icon }: TileProps) => (
  <View
    style={{
      flexBasis: '48%',
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS,
      padding: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: COLORS.outline,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
      <Icon size={20} color="rgba(255,255,255,0.65)" style={{ marginRight: 8 }} />
      <RNText allowFontScaling={false} style={{ color: COLORS.text, fontWeight: '700', flexShrink: 1 }}>
        {label}
      </RNText>
      {soon ? (
        <View
          style={{
            marginLeft: 8,
            backgroundColor: COLORS.pill,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
          }}
        >
          <RNText
            allowFontScaling={false}
            style={{
              color: COLORS.textSub,
              fontSize: 10,
              fontWeight: '800',
              letterSpacing: 0.5,
            }}
          >
            SOON
          </RNText>
        </View>
      ) : null}
    </View>
    {caption ? (
      <RNText allowFontScaling={false} style={{ color: COLORS.textMuted, fontSize: 12, lineHeight: 16 }}>
        {caption}
      </RNText>
    ) : null}
  </View>
));

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
        style={{ paddingTop: insets.top, backgroundColor: COLORS.bg }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingBottom: 32,
        }}
      >
        <VStack space="sm" className="w-full" style={{ maxWidth: 520 }}>
          {/* ---------- Header ---------- */}
          <Box className="items-center" style={{ paddingTop: 24, paddingBottom: 6 }}>
            <Box className="flex-row items-center" style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image
                source={require('@/assets/images/icons/emipoint-icon-red.png')}
                style={{ width: 32, height: 32, marginRight: 10, tintColor: '#FFFFFF' }}
                resizeMode="contain"
              />
              <RNText allowFontScaling={false} style={{ color: COLORS.text, fontSize: 28, lineHeight: 28 }}>
                <RNText style={{ fontWeight: '800' }}>Emi</RNText>
                <RNText>Points</RNText>
              </RNText>
            </Box>
            <RNText
              allowFontScaling={false}
              style={{ color: COLORS.textSub, fontSize: 12, letterSpacing: 6, fontWeight: '900', marginTop: 6, marginBottom: 12 }}
            >
              REWARDS
            </RNText>
          </Box>

          {/* ---------- Balance card ---------- */}
          <Box className="rounded-2xl w-full" style={{ backgroundColor: COLORS.card }}>
            <VStack space="md" className="p-5" style={{ alignItems: 'center' }}>
              <RNText allowFontScaling={false} style={{ color: '#AAAAAA', fontSize: 12, marginBottom: 6 }}>
                Your balance
              </RNText>
              <RNText allowFontScaling={false} style={{ color: COLORS.text, fontSize: 44, fontWeight: '800', lineHeight: 52 }}>
                {loading ? '…' : `${(points ?? 0).toFixed(2)} EP`}
              </RNText>
              <RNText allowFontScaling={false} style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>
                EP = EmiPoints
              </RNText>

              <Pressable
                onPress={() => setHistoryOpen(true)}
                style={{
                  marginTop: 10,
                  backgroundColor: COLORS.brand,
                  paddingVertical: 10,
                  paddingHorizontal: 18,
                  borderRadius: 8,
                }}
              >
                <RNText allowFontScaling={false} style={{ color: '#FFFFFF', fontWeight: '800' }}>
                  View history
                </RNText>
              </Pressable>
            </VStack>
          </Box>

          {/* ---------- Available now ---------- */}
          <SectionTitle>What you can do today</SectionTitle>


          {/* ---------- Referral code card ---------- */}
          <Box className="rounded-2xl w-full" style={{ backgroundColor: COLORS.card }}>
            <VStack className="p-5" space="md" style={{ alignItems: 'center' }}>
              <RNText allowFontScaling={false} style={{ color: COLORS.text, fontSize: 18, fontWeight: '700' }}>
                Your referral code
              </RNText>
              <Box
                className="w-full flex-row items-center justify-between rounded-xl"
                style={{ backgroundColor: COLORS.surface, paddingVertical: 12, paddingHorizontal: 14, marginTop: 6 }}
              >
                <RNText allowFontScaling={false} style={{ color: COLORS.text, fontSize: 16, letterSpacing: 1 }}>
                  {referralLoading ? '…' : referralCode}
                </RNText>
                <TouchableOpacity onPress={copyReferral} activeOpacity={0.8}>
                  <Box
                    className="rounded-full items-center justify-center"
                    style={{ backgroundColor: COLORS.brand, paddingVertical: 8, paddingHorizontal: 14 }}
                  >
                    <RNText allowFontScaling={false} style={{ color: '#FFFFFF', fontWeight: '700' }}>
                      Copy
                    </RNText>
                  </Box>
                </TouchableOpacity>
              </Box>
            </VStack>
          </Box>
		  <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
		    <FeatureTile
		      Icon={Wallet}
		      label="Earn via Pix"
		      caption="1 USD paid = 10 EP. Any eligible stablecoin/token."
		    />
		    <FeatureTile
		      Icon={Users}
		      label="Refer & earn"
		      caption="Earn 10% of friends' EP. If referred, 2% bonus on Pix payments."
		    />
		  </View>
          {/* ---------- Sneak peek ---------- */}
          <SectionTitle subtitle="What we're exploring — more details TBA.">
            Sneak peek
          </SectionTitle>

          <RNText allowFontScaling={false} style={{ color: COLORS.textSub, fontSize: 12, marginBottom: 6 }}>
            Redeem (concept)
          </RNText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <FeatureTile
              Icon={Link}
              label="On-chain partners"
              caption="Redeem or swap with supported protocols."
              soon
            />
            <FeatureTile
              Icon={ShoppingBag}
              label="Off-chain partners"
              caption="Brands, gift cards, and experiences."
              soon
            />
          </View>

          <RNText allowFontScaling={false} style={{ color: COLORS.textSub, fontSize: 12, marginTop: 8, marginBottom: 6 }}>
            Earning multipliers (concept)
          </RNText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <FeatureTile Icon={Users} label="More Referral" caption="More ways to boost your referrals." soon />
            <FeatureTile Icon={Building2} label="Selected merchants" caption="Seasonal partner boosts." soon />
            <FeatureTile Icon={Zap} label="Chains & networks" caption="Extra EP on specific chains." soon />
            <FeatureTile Icon={Coins} label="Tokens / currencies" caption="Boosts for certain payment pairs." soon />
          </View>

          <RNText allowFontScaling={false} style={{ color: COLORS.textSub, fontSize: 12, marginTop: 8, marginBottom: 6 }}>
            Program shape (concept)
          </RNText>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <FeatureTile Icon={Gift} label="One-time redemptions" caption="Use EP for moments or perks." soon />
            <FeatureTile Icon={Infinity} label="All-time accrual" caption="Lifetime EP for major campaigns." soon />
            <FeatureTile Icon={Trophy} label="Tiers & specials" caption="Periodic events and rewards." soon />
            <FeatureTile Icon={Compass} label="Explore partners" caption="On/off-chain curated options." soon />
          </View>

          {/* ---------- Footer ---------- */}
          <RNText allowFontScaling={false} style={{ color: '#6F6F6F', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
            Visuals marked “SOON” are conceptual and may evolve.
          </RNText>
          <RNText allowFontScaling={false} style={{ color: '#6F6F6F', fontSize: 12, textAlign: 'center' }}>
            v1 — Rewards in development
          </RNText>
        </VStack>
      </ScrollView>

      {/* ---------- History modal ---------- */}
      <RewardPointsHistorySheet isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
});

export default EmiPointsScreen;
