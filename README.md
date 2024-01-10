# Emigro Mobile

## Overview

Interface developed with React Native + Typescript, to consume Emigro API. Creating, logging users and making payments between users.

## Powered by

- React Native.
- Typescript.
- Jest.
- React Testing Library

## How to run it

1. You've to install it with npm ci/install
2. You've to populate the .env file using the .env.dist file as a guide
3. Then, you can execute `npm run start`

## How to run unit & integration tests

Jest: Execute `npm run test`

### Environment variables

#### Database

| Variable              | Description                                 | URL
| -------------         | ---------------------                       | ---------------------
| `EXPO_PUBLIC_BACKEND_URL`         | Backend Url where Emigro API is consumed.   | 
| `EXPO_PUBLIC_GEOCODE_BASE_URL`    | Base URL for geocoding requests.            | [https://nominatim.openstreetmap.org/search](https://nominatim.openstreetmap.org/search)

## Local Development

Requirements:
- OpenJDK 11
- Android Studio

Install and prepare the environment:

	# macOS users
	brew install openjdk@11
	export JAVA_HOME=$(/usr/libexec/java_home -v11)
	export ANDROID_HOME=$HOME/Library/Android/sdk

Build the app:

	eas build --local  --clear-cache --platform android

### Troubleshooting

<details>
<summary>Build failed on download boost 1.76</summary>

```
Execution failed for task ':expo-modules-core:prepareBoost'.
Could not read /home/expo/workingdir/build/node_modules/expo-modules-core/android/build/downloads/boost_1_76_0.tar.gz.
```


SOLVED: https://github.com/expo/expo/issues/19596#issuecomment-1880842689

	rm -rf node_modules && npm install
	npx expo prebuild --platform android
	cd android && ./gradlew clean
	eas build --local  --platform android
</details>
