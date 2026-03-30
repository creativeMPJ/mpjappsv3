import { Suspense, ComponentType } from 'react';

/**
 * Loadable Component - Lazy Loading Wrapper
 *
 * Wraps lazy-loaded components with Suspense and loading state
 * Using existing loading pattern from ProtectedRoute.tsx
 */
const Loadable = <P extends object>(Component: ComponentType<P>) => {
  const LoadableComponent = (props: P) => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Memuat...</p>
          </div>
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  );

  return LoadableComponent;
};

export default Loadable;
