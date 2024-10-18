# Emigro Mobile

Emigro Mobile is a digital wallet application designed for travelers, available on both iOS and Android platforms. It offers a seamless and secure way to manage multiple currencies, make payments, and track expenses while on the go.

Key features include:

- **Multi-currency support:** Manage and exchange multiple currencies effortlessly.
- **Secure transactions:** Ensure the safety of your financial transactions protecting with PIN
- **QR code payments:** Quickly and easily make payments using QR codes.

Powered by

- [Expo](https://expo.dev/)
- React Native
- Typescript
- Jest

# Getting Started

### Environment variables

| Variable              | Description                                 | URL
| -------------         | ---------------------                       | ---------------------
| `EXPO_PUBLIC_BACKEND_URL`         | Backend Url where Emigro API is consumed.   | http://localhost:3000

## Local Development

1. Copy the `.env.sample` file to `.env.local` and update the environment variables:

```sh
cp .env.sample .env.local
vi .env.local 
```

**Tip:** use `https://api.emigro.co` to consume for production API

2. Install the dependencies using NPM:

```sh
npm i
```

3. Run the Expo Metro and follow the instructions:

```sh
npm run start
```

4. Running tests:

```sh
npm test
```

## Platform Guide

### iOS

Requirements:
- XCode
- iOS Simulator

### Android

Requirements:
- OpenJDK 11
- Android Studio

Install and prepare the environment:

For macOS users:

```sh
brew install openjdk@11
export JAVA_HOME=$(/usr/libexec/java_home -v11)
export ANDROID_HOME=$HOME/Library/Android/sdk
```

Build the app:

	eas build --local --clear-cache --platform android

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


# Publishing Releases

To publish a new preview version for TestFlight and Open Testing in Google Play, follow these steps:

1. Checkout the `preview` branch:
```sh
git checkout preview
```

2. Merge the `main` branch into `preview`:
```sh
git merge main
```

3. Push the changes to the `preview` branch:
```sh
git push
```

This will trigger the CI/CD pipeline to build and publish the new version to TestFlight and Google Play Open Testing.

**Notes:**
- Ensure all changes are thoroughly tested before merging into the preview branch.
- Monitor the build and deployment process in [GitHub Actions](https://github.com/emigro-br/emigro-mobile/actions) and [Expo Dashboard](https://expo.dev/accounts/emigro) to ensure there are no issues.
