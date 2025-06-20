import React, { useEffect } from 'react';
import { ErrorFallbackProps } from './components-ErrorBoundary';

const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => (
  <div className="p-4 bg-red-100 text-red-800 rounded">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary} className="mt-2 p-2 bg-red-500 text-white rounded">
      Try again
    </button>
  </div>
);

export default ErrorFallback;