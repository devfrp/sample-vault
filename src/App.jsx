import { useEffect } from 'react';
import { useSampleStore } from './store';
import Layout from './components/Layout';

export default function App() {
  const rehydrate = useSampleStore((s) => s.rehydrate);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  return <Layout />;
}
