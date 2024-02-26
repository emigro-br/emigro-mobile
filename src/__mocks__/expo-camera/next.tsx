// Cannot find native module 'ExpoCameraNext'
// Not implemented in jest-expo yet: https://github.com/expo/expo/blob/main/packages/jest-expo/src/preset/expoModules.js
export default {
  CameraView: () => <></>,
  useCameraPermissions: () => [null, () => {}],
};
