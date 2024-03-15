import App from './src/App';
import * as Sentry from '@sentry/react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    debug: __DEV__, // Enable debug in development mode
    environment: __DEV__ ? 'development' : 'production',
    sampleRate: 1.0, // Send 100% of events for while developing
    tracesSampleRate: 0.5,
  });
}

export default App;
