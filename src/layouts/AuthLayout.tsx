import { Outlet } from 'react-router-dom';
export const AuthLayout = () => { return (<div className='flex min-h-screen flex-col items-center justify-center bg-background p-4'><div className='w-full max-w-md rounded-xl border bg-card p-8 shadow-card'><div className='mb-8 text-center text-2xl font-bold text-primary'>PlacementX</div><Outlet /></div><footer>Footer</footer></div>); };
