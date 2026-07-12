import { Link } from 'react-router-dom';
export const Unauthorized = () => <div className='flex h-screen flex-col items-center justify-center'><h1>403 - Unauthorized</h1><Link to='/'>Go Home</Link></div>;
