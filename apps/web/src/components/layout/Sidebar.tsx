import { Link, useLocation } from 'react-router-dom';

export const Sidebar = ({ items }: { items: { name: string, href: string, icon: any }[] }) => {
  const location = useLocation();

  return (
    <nav className="flex flex-col space-y-1 p-4">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center space-x-3 rounded-md px-3 py-2 transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
