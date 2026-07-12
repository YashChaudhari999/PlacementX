import { Link, useLocation } from 'react-router-dom';
import { getBreadcrumbs } from '@/config/navigation';
import { ChevronRight } from 'lucide-react';
export const Breadcrumb = () => { const location = useLocation(); const crumbs = getBreadcrumbs(location.pathname); return (<nav className='flex items-center space-x-1 text-sm text-muted-foreground'>{crumbs.map((crumb, idx) => (<div key={crumb.href} className='flex items-center'>{idx > 0 && <ChevronRight className='h-4 w-4 mx-1' />}<Link to={crumb.href} className='hover:text-foreground transition-colors'>{crumb.name}</Link></div>))}</nav>); };
