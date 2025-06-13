import React from 'react';
import { useRouter } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';

import emigroLogo from '@/assets/images/emigro-logo.png';
import backgroundImage from '@/assets/images/background.png';

import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';

import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { backendUrl } from '@/services/emigro/api';
import * as AuthSession from 'expo-auth-session';
import { View, Animated, Platform, Pressable } from 'react-native';
import { useRef, useState } from 'react';
import googleLogo from '@/assets/images/google-logo.png';

WebBrowser.maybeCompleteAuthSession();

export const Welcome = () => {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  

  const clientIds = {
    android: '994789891634-on3kh51cjsdcqndloq6cplqrog63bpah.apps.googleusercontent.com',
    ios: '994789891634-dtrtj3vq4e3q6odr1me9blgv9e0q7qqs.apps.googleusercontent.com',
    web: '994789891634-v0rns44ethbtvev4u8q96sdmbec4kclt.apps.googleusercontent.com',
  };

  const platform = Platform.OS;

  const clientId = platform === 'android'
    ? clientIds.android
    : platform === 'ios'
      ? clientIds.ios
      : clientIds.web;

  // ✅ Dynamically create redirectUri based on platform's clientId
  const nativeRedirectUri = `com.googleusercontent.apps.${clientId.split('.apps')[0]}:/oauthredirect`;

  const redirectUri = AuthSession.makeRedirectUri({
    native: nativeRedirectUri,
    useProxy: false,
  });
  
  useEffect(() => {
	const handleDeepLink = async ({ url }: { url: string }) => {
	  const parsed = Linking.parse(url);
	  const idToken = parsed.queryParams?.id;
	  const accessToken = parsed.queryParams?.access;
	  const isNewUser = parsed.queryParams?.new === 'true';

	  if (idToken && accessToken) {
	    await sessionStore.setSession({ idToken, accessToken });
	    try {
	      await sessionStore.fetchProfile();
	    } catch (e) {
	      console.warn('Failed to fetch profile after login:', e);
	    }

	    if (isNewUser) {
	      router.replace('/(auth)/onboarding/choose-bank-currency');
	    } else {
	      router.replace('/');
	    }
	  }
	};


    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    const sub = Linking.addEventListener('url', handleDeepLink);
    return () => sub.remove(); // Clean up listener on unmount
  }, []);


  const discovery = {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  };

  const [request, response, promptAsync] = Google.useAuthRequest(
    {
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: 'code',
      state: Math.random().toString(36).substring(2),
    },
    discovery
  );


  const handleOAuthLogin = async (provider: 'google' | 'apple', token: string) => {
    try {
      const res = await fetch(`${backendUrl}/auth/oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider, token }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OAuth login failed');

	  await sessionStore.setSession(data.session);
	  try {
	    await sessionStore.fetchProfile();
	  } catch (e) {
	    console.warn('Failed to fetch profile after OAuth login:', e);
	  }
	  router.replace('/');
    } catch (err: any) {
      setApiError(err.message);
    }
  };
  
  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <Box className="flex-1 px-4 justify-between py-20">
        <Center className="mt-20">
          <Image source={emigroLogo} alt="Emigro logo" className="h-20 w-80 mb-10" />
          <Text size="2xl" bold className="text-white mb-2 text-center">
            Borderless finance for nomads
          </Text>
          <Text size="lg" className="text-white text-center">
            
          </Text>
        </Center>

        <ButtonGroup space="md" flexDirection="column">
          {/* Login Button */}
          <Button
            onPress={() => router.push('/login')}
            variant="solid"
            size="xl"
            className="rounded-full bg-[#890000] py-4 h-14"
          >
            <ButtonText className="text-white">Login</ButtonText>
          </Button>

          {/* Create Account Button */}
          <Button
            onPress={() => router.push('/signup')}
            variant="outline"
            size="xl"
            className="rounded-full border-white  py-4 h-14"
          >
            <ButtonText className="text-white">Create Account</ButtonText>
          </Button>
        
		
		{/* Separator */}
		{/* <View className="flex-row items-center my-4">
		  <View className="flex-1 h-px bg-white" />
		  <Text className="mx-3 text-white text-sm font-medium">OR CREATE ACCOUNT / LOGIN WITH</Text>
		  <View className="flex-1 h-px bg-white" />
		</View>*/}

		{/* Sign in Google */}
		{/*<Pressable
		  onPressIn={animatePress}
		  onPress={async () => {
		    try {
		      const result = await promptAsync();

		      if (result.type === 'success' && result.params?.code) {
		        const code = result.params.code;

		        // Get redirect URL from backend
		        const res = await fetch(`${backendUrl}/auth/oauth/callback?code=${code}`);
		        const redirectUrl = await res.text();

		        // Trigger app's deep link handler
		        Linking.openURL(redirectUrl);
		      } else {
		        setApiError('Google login canceled or failed');
		      }
		    } catch (e) {
		      console.error('Error during Google login:', e);
		      setApiError('Google login failed. Please try again.');
		    }
		  }}


		  disabled={!request || isLoggingIn}
		>
		  <Animated.View
		    style={{ transform: [{ scale: scaleAnim }] }}
		    className={`bg-white rounded-full py-4 items-center justify-center mt-2 ${
		      (!request || isLoggingIn) ? 'opacity-50' : ''
		    }`}
		  >
		    <View className="flex-row items-center space-x-2">
			<Image
			  source={googleLogo}
			  className="w-5 h-5 mr-3"
			  resizeMode="contain"
			/>
			<Text
			  className="text-black font-semibold text-[19px]"
			  style={{ letterSpacing: 0.5 }}
			>
		        {isLoggingIn ? 'Signing in...' : 'Sign in with Google'}
		      </Text>
		    </View>
		  </Animated.View>
		</Pressable>


		{Platform.OS === 'ios' && (
		  <View style={{ marginTop: 10, borderRadius: 999, overflow: 'hidden' }}>
		    <AppleAuthentication.AppleAuthenticationButton
		      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
		      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE} // try WHITE for better match
		      cornerRadius={999} // mimic full-rounded
		      style={{ width: '100%', height: 56 }} // match height with Google button
		      onPress={async () => {
		        try {
		          const credential = await AppleAuthentication.signInAsync({
		            requestedScopes: [
		              AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
		              AppleAuthentication.AppleAuthenticationScope.EMAIL,
		            ],
		          });

		          if (credential.identityToken) {
		            handleOAuthLogin('apple', credential.identityToken);
		          }
		        } catch (error) {
		          console.error(error);
		        }
		      }}
		    />
		  </View>
		)}*/}

		</ButtonGroup>
      </Box>
	  
    </ImageBackground>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
