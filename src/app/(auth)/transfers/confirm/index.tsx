import { Redirect, usePathname } from 'expo-router';

export default function Index() {
  const path = usePathname();
  return <Redirect href={`${path}/pin`} />;
}
