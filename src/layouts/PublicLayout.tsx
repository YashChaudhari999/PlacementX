import { Outlet } from 'react-router-dom';
export const PublicLayout = () => { return (<div className='flex min-h-screen flex-col'><header>Navbar</header><main className='flex-1'><Outlet /></main><footer>Footer</footer></div>); };
