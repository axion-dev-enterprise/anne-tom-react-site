import { useState, useCallback } from 'react';
import logger from '../utils/logger';

export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = useCallback((error, context = {}) => {
    const errorData = {
      message: error.message || 'Unknown error occurred',
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    logger.error('Application error', errorData);
    setError(errorData);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};

export default useErrorHandler;
