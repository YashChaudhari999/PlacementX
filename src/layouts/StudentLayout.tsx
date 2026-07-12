import { Outlet } from 'react-router-dom';
export const StudentLayout = () => { return (<div className='flex min-h-screen'><aside className='hidden md:flex w-64 border-r bg-sidebar'>Sidebar</aside><div className='flex flex-1 flex-col'><header className='h-16 border-b bg-navbar'>Top Navbar</header><main className='flex-1 p-6'><div className='mb-4'>Breadcrumb</div><Outlet /></main></div></div>); };
