import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import Layout from '@/components/layout';
import Designer from '@/components/designer';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pump-track-theme">
      <TooltipProvider>
        <Layout>
          <Designer />
        </Layout>
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;