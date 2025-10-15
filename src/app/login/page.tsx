import { LoginForm } from '@/components/LoginForm';
import { getStocks } from '@/lib/stocks';

export default async function LoginPage() {
  const { stocks } = await getStocks();
  
  return <LoginForm stocks={stocks} />;
}
