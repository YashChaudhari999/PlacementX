import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppShell } from '@/app/shell/AppShell';

function App() {
  return (
    <AppProviders>
      <AppShell>
        <RouterProvider router={router} />
      </AppShell>
    </AppProviders>
  );
}

export default App;
