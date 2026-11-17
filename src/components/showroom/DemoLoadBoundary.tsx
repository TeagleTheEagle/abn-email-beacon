import { Component, Suspense, type ReactNode } from "react";

class DemoErrorBoundary extends Component<
  { title: string; children: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    if (this.state.failed) {
      return (
        <div role="alert" className="grid min-h-40 place-items-center bg-surface p-6 text-center">
          <div>
            <p className="text-sm text-foreground">
              The {this.props.title} preview could not load.
            </p>
            <button
              type="button"
              className="btn-chrome mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function DemoLoadBoundary({ title, children }: { title: string; children: ReactNode }) {
  return (
    <DemoErrorBoundary title={title}>
      <Suspense
        fallback={
          <p role="status" className="p-4 text-center text-sm text-muted-foreground">
            Loading {title}…
          </p>
        }
      >
        {children}
      </Suspense>
    </DemoErrorBoundary>
  );
}
