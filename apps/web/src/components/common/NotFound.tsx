import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search01Icon, ArrowLeft01Icon } from 'hugeicons-react';

export const NotFound = () => (
 <div className="min-h-screen flex flex-col items-center justify-center bg-muted px-6">
 <div className="max-w-md w-full text-center space-y-6">
 <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-gray-50/50 shadow-sm">
 <Search01Icon className="w-10 h-10 text-muted-foreground"/>
 </div>
 <h1 className="text-4xl font-black text-foreground tracking-tight">404</h1>
 <h2 className="text-xl font-bold text-foreground">Page Not Found</h2>
 <p className="text-muted-foreground text-sm max-w-xs mx-auto">
 We couldn't find the page you were looking for. It might have been moved or doesn't exist.
 </p>
 <div className="pt-6">
 <Link to="/">
 <Button className="w-full bg-[#C8102E] hover:bg-[#a00c25] text-white">
 <ArrowLeft01Icon className="w-4 h-4 mr-2"/>
 Back to Home
 </Button>
 </Link>
 </div>
 </div>
 </div>
);
