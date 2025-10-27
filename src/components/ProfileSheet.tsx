// src/components/ProfileSheet.tsx

import React, { useState } from 'react';
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
import { Toast, ToastDescription, useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { sessionStore } from '@/stores/SessionStore';
import { Pressable, TextInput, View, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import * as Haptics from 'expo-haptics';
import { backendUrl as API_BASE } from '@/services/emigro/api';
import { runInAction } from 'mobx';
import * as ImagePicker from 'expo-image-picker';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const getFilenameFromUri = (uri: string, fallback: string) => {
  try {
    const base = uri.split('/').pop() || fallback;
    return base.includes('.') ? base : `${base}.jpg`;
  } catch {
    return fallback;
  }
};

export const ProfileSheet = ({ visible, onClose }: Props) => {
  const toast = useToast();

  const currentUsername =
    (sessionStore.user as any)?.username ??
    (sessionStore.profile as any)?.preferred_username ??
    '';

  const currentPhotoUrl =
    (sessionStore.user as any)?.profileImageUrl ??
    (sessionStore.profile as any)?.picture ??
    null;

  const [username, setUsername] = useState<string>(currentUsername);
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl);

  // Only true while we actually do network work (presign, upload)
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyMsg, setBusyMsg] = useState<string | null>(null);
  // UI constraints for username input (visual only; backend remains source of truth)
  const MAX_USERNAME = 32;
  const USERNAME_PATTERN = /^[a-zA-Z0-9._]*$/;

  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Referral code: if the user already has a referrer, we show the code read-only.
  const existingReferredByCode =
    (sessionStore.user as any)?.referredByCode ?? null;
  const hasReferrerAlready =
    !!existingReferredByCode ||
    !!(sessionStore.user as any)?.referredByUserId;

  const [referredByCode, setReferredByCode] = useState<string>(
    existingReferredByCode ?? ''
  );

  const onChangeReferredBy = (v: string) => {
    // Visual constraint: uppercase and max 6 chars
    setReferredByCode(v.toUpperCase().slice(0, 6));
  };

  const onChangeUsername = (value: string) => {
    // Do not auto-mutate user input (no forced lowercase); just validate & allow only permitted chars visually.
    if (!USERNAME_PATTERN.test(value)) {
      setUsernameError('Only letters, numbers, underscore (_) and dot (.) are allowed.');
    } else {
      setUsernameError(null);
    }
    setUsername(value);
  };

  // ---------- PICK & UPLOAD ----------
  const pickImage = async () => {
    try {
		 // 1) Image picker is statically imported at top. Proceed.


	  // 2) Permissions
	  // `launchImageLibraryAsync` doesn't require a manual permission request on most platforms.
	  // Some SDKs still expose `requestMediaLibraryPermissionsAsync`; if it's present, use it.
	  if (typeof ImagePicker?.requestMediaLibraryPermissionsAsync === 'function') {
	    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
	    if (!(perm?.granted === true || perm?.status === 'granted')) {
	      toast.show({
	        render: ({ id }) => (
	          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
	            <ToastDescription>Permission to access photos is required.</ToastDescription>
	          </Toast>
	        ),
	      });
	      return;
	    }
	  }


	  // If the method is undefined, continue without requesting permissions.


      // 3) Launch picker — handle old/new SDKs
	  const mediaTypesCompat =
	    (ImagePicker as any)?.MediaType?.Images ??
	    (ImagePicker as any)?.MediaTypeOptions?.Images ??
	    undefined;



      const pickerOptions: any = {
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.92,
      };
      if (mediaTypesCompat) pickerOptions.mediaTypes = mediaTypesCompat;

      const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
      if (result.canceled || !result.assets?.length) return;

      // 4) Now we actually do work: presign + upload
      setUploading(true);
      setBusyMsg('Preparing upload…');

      const asset = result.assets[0];
      const fileUri = asset.uri;
      const contentType = asset.mimeType || 'image/jpeg';
      const filename = getFilenameFromUri(fileUri, 'avatar.jpg');

      // Use ACCESS TOKEN for API auth
      const accessToken = sessionStore.accessToken;

      const qs = new URLSearchParams({
        filename,
        contentType,
        folder: 'avatars',
      });

      setBusyMsg('Requesting upload URL…');
      const pres = await fetch(`${API_BASE}/uploads/presigned?${qs}`, {
        method: 'GET',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      if (!pres.ok) {
        const t = await pres.text();
        throw new Error(`Presign failed: ${pres.status} ${t}`);
      }
      const { uploadUrl, publicUrl } = await pres.json();
      if (!uploadUrl || !publicUrl) throw new Error('Invalid presigned response');

      setBusyMsg('Uploading photo…');
      const resp = await fetch(fileUri);
      const blob = await resp.blob();

      const put = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
      if (!put.ok) {
        const t = await put.text();
        throw new Error(`S3 upload failed: ${put.status} ${t}`);
      }

      setPhotoUrl(publicUrl);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="muted" variant="solid">
            <ToastDescription>Photo updated</ToastDescription>
          </Toast>
        ),
      });
    } catch (e: any) {
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastDescription>{e?.message || 'Upload failed'}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setBusyMsg(null);
      setUploading(false);
    }
  };

  const removePhoto = () => {
    setPhotoUrl(null);
  };

  // ---------- SAVE PROFILE ----------
  const saveProfile = async () => {
    try {
      setSaving(true);
      setBusyMsg('Saving profile…');

	  const body: any = {
	    username: username?.trim() || null,
	    profileImageUrl: photoUrl || null,
	  };

	  // Only send referredByCode if user has no referrer yet and input is 6 chars
	  if (!hasReferrerAlready && referredByCode.trim().length === 6) {
	    body.referredByCode = referredByCode.trim().toUpperCase();
	  }

      const accessToken = sessionStore.accessToken;

      const res = await fetch(`${API_BASE}/user/profile-basic`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Save failed: ${res.status} ${t}`);
      }

      // Update store for instant UI sync
	  const saved = await res.json();

	  runInAction(() => {
	    const prev = sessionStore.user || {};
	    (sessionStore as any).user = {
	      ...prev,
	      username: saved?.username ?? body.username ?? undefined,
	      profileImageUrl: saved?.profileImageUrl ?? body.profileImageUrl ?? undefined,
	      // attach referral fields if backend returned them
	      referredByUserId: saved?.referredByUserId ?? (prev as any).referredByUserId,
	      referredByCode: saved?.referredByCode ?? (prev as any).referredByCode,
	      referralCode: saved?.referralCode ?? (prev as any).referralCode,
	    };

	    const p = sessionStore.profile || ({} as any);
	    (sessionStore as any).profile = {
	      ...p,
	      preferred_username:
	        saved?.username ?? body.username ?? p?.preferred_username,
	      picture:
	        saved?.profileImageUrl ?? body.profileImageUrl ?? p?.picture,
	    };
	  });


      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="muted" variant="solid">
            <ToastDescription>Profile saved</ToastDescription>
          </Toast>
        ),
      });
      onClose();
    } catch (e: any) {
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast-${id}`} action="error" variant="solid">
            <ToastDescription>{e?.message || 'Could not save'}</ToastDescription>
          </Toast>
        ),
      });
    } finally {
      setBusyMsg(null);
      setSaving(false);
    }
  };

  // ---------- UI ----------
  const isLoading = uploading || saving || !!busyMsg;

  return (
    <Actionsheet isOpen={visible} onClose={onClose}>
      <ActionsheetBackdrop />
	  <ActionsheetContent
	    style={{
	      backgroundColor: '#0a0a0a',
	      borderTopLeftRadius: 24,
	      borderTopRightRadius: 24,
	      paddingTop: 12,
	      paddingBottom: 64,
	      flex: 1,
	    }}
	  >
	    <KeyboardAvoidingView
	      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
	      keyboardVerticalOffset={Platform.OS === 'ios' ? 36 : 0}
	      style={{ flex: 1 }}
	    >
	      <ScrollView
	        keyboardShouldPersistTaps="handled"
	        bounces={false}
	        contentContainerStyle={{ paddingBottom: 40 }}
	      >
	        {/* Spinner overlay (only during work) */}
	        {isLoading && (
	          <View
	            style={{
	              position: 'absolute',
	              top: 0,
	              left: 0,
	              right: 0,
	              bottom: 0,
	              backgroundColor: 'rgba(0,0,0,0.6)',
	              zIndex: 9999,
	              alignItems: 'center',
	              justifyContent: 'center',
	            }}
	          >
	            <Spinner size="large" color="#fe0055" />
	            <Text style={{ color: '#fff', marginTop: 12 }}>
	              {busyMsg ?? (uploading ? 'Uploading photo…' : 'Saving profile…')}
	            </Text>
	          </View>
	        )}

	        {/* Close */}
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

	        <Text className="text-lg font-bold text-center mb-3" style={{ color: '#fff' }}>
	          Edit Profile
	        </Text>

	        <VStack space="lg" className="w-full px-4">
	          {/* Photo preview + actions */}
	          <View style={{ alignItems: 'center', marginTop: 2 }}>
	            <View
	              style={{
	                width: 108,
	                height: 108,
	                borderRadius: 54,
	                overflow: 'hidden',
	                borderWidth: 1,
	                borderColor: '#333',
	                backgroundColor: '#141414',
	              }}
	            >
	              {photoUrl ? (
	                <Image
	                  source={{ uri: photoUrl }}
	                  style={{ width: '100%', height: '100%' }}
	                  resizeMode="cover"
	                />
	              ) : (
	                <View
	                  style={{
	                    flex: 1,
	                    alignItems: 'center',
	                    justifyContent: 'center',
	                  }}
	                >
	                  <Text style={{ color: '#666' }}>No photo</Text>
	                </View>
	              )}
	            </View>

	            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
	              <Button onPress={pickImage} isDisabled={uploading || saving}>
	                <ButtonText>Pick image</ButtonText>
	              </Button>
	              <Button onPress={removePhoto} variant="outline" isDisabled={uploading || saving}>
	                <ButtonText>Remove</ButtonText>
	              </Button>
	            </View>
	          </View>

	          {/* Username */}
	          <View style={{ marginTop: 12 }}>
	            <Text style={{ color: '#cbd5e1', marginBottom: 8 }}>Username</Text>
	            <TextInput
	              value={username}
	              onChangeText={onChangeUsername}
	              placeholder="yourname"
	              placeholderTextColor="#64748b"
	              autoCapitalize="none"
	              autoCorrect={false}
	              textContentType="username"
	              maxLength={MAX_USERNAME}
	              selectionColor="#fe0055"
	              style={{
	                backgroundColor: '#0b1220',
	                borderColor: usernameError ? '#ef4444' : '#1f2937',
	                borderWidth: 1,
	                color: '#e5e7eb',
	                borderRadius: 10,
	                paddingHorizontal: 12,
	                paddingVertical: 10,
	                fontSize: 16,
	              }}
	            />
	            <View style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
	              <Text style={{ color: usernameError ? '#fca5a5' : '#94a3b8', fontSize: 12 }}>
	                {usernameError
	                  ? usernameError
	                  : 'Only letters, numbers, underscore (_) and dot (.) are allowed.'}
	              </Text>
	              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
	                {username?.length ?? 0}/{MAX_USERNAME}
	              </Text>
	            </View>
	          </View>

	          {/* Referred By Code (read-only if already set) */}
	          <View style={{ marginTop: 16 }}>
	            <Text style={{ color: '#cbd5e1', marginBottom: 8 }}>Referral code (optional)</Text>
	            <TextInput
	              value={hasReferrerAlready ? (existingReferredByCode ?? '—') : referredByCode}
	              onChangeText={onChangeReferredBy}
	              placeholder="ABC123"
	              placeholderTextColor="#64748b"
	              autoCapitalize="characters"
	              autoCorrect={false}
	              maxLength={6}
	              editable={!hasReferrerAlready}
	              selectionColor="#fe0055"
	              style={{
	                backgroundColor: hasReferrerAlready ? '#0f172a' : '#0b1220',
	                borderColor: hasReferrerAlready ? '#334155' : '#1f2937',
	                borderWidth: 1,
	                color: hasReferrerAlready ? '#94a3b8' : '#e5e7eb',
	                borderRadius: 10,
	                paddingHorizontal: 12,
	                paddingVertical: 10,
	                fontSize: 16,
	              }}
	            />
	            <View style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'space-between' }}>
	              <Text style={{ color: '#94a3b8', fontSize: 12 }}>
	                {hasReferrerAlready
	                  ? 'A referral code is already applied to your account. You’re earning 2% extra EmiPoints on Pix payments and transfers.'
	                  : 'Add a referral code to earn 2% extra EmiPoints on your Pix payments and transfers.'}
	              </Text>
	              {!hasReferrerAlready && (
	                <Text style={{ color: '#94a3b8', fontSize: 12 }}>
	                  {referredByCode.length}/6
	                </Text>
	              )}
	            </View>
	          </View>

	          {/* Save */}
	          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
	            <Button
	              onPress={saveProfile}
	              isDisabled={uploading || saving || !!usernameError}
	            >
	              <ButtonText>{saving ? 'Saving…' : 'Save changes'}</ButtonText>
	            </Button>
	            <Button onPress={onClose} variant="outline" isDisabled={uploading || saving}>
	              <ButtonText>Cancel</ButtonText>
	            </Button>
	          </View>
	        </VStack>
	      </ScrollView>
	    </KeyboardAvoidingView>
	  </ActionsheetContent>

    </Actionsheet>
  );
};

export { ProfileSheet as ProfileEditSheet };
