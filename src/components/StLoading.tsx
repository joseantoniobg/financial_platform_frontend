import Lottie from 'lottie-react';
import animationData from './animations/money.json';

export function StLoading({ children, loading }: { children?: React.ReactNode, loading: boolean }) {
    if (!loading) {
        return <>{children}</>;
    }

    return (
                <div className="m-0 p-0 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                      <Lottie 
                        animationData={animationData} 
                        loop={true}
                        className='w-90 h-90 mx-auto'
                      />
                      <p className="mt-0 text-[hsl(var(--foreground))] font-medium">Carregando...</p>
                    </div>
                </div>
          );
}