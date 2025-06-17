import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

export const ErrorBoundary = ({ children }) => (
  <ReactErrorBoundary
    fallbackRender={({ error, resetErrorBoundary }) => (
      <div className="p-4 bg-red-100 text-red-800 rounded">
        <h2>Something went wrong:</h2>
        <pre>{error.message}</pre>
        <button onClick={resetErrorBoundary}>Try again</button>
      </div>
    )}
  >
    {children}
  </ReactErrorBoundary>
);

// Add error boundary for specific components
export const ErrorFallbackComponent = ({ error }) => (
  <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
    <h2>Error occurred:</h2>
    <pre>{error.message}</pre>
  </div>
);