import React from 'react';

const ErrorBoundaryFallback = ({ error, resetError }) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🍕</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Ops! Algo deu errado
        </h1>
        <p className="text-slate-600 mb-6">
          Estamos trabalhando para resolver isso. Por favor, tente novamente em alguns instantes.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleReload}
            className="w-full px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Recarregar página
          </button>
          <button
            onClick={handleGoHome}
            className="w-full px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Voltar para o início
          </button>
          <a
            href="https://api.whatsapp.com/send?phone=5511932507007"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full px-6 py-3 border border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Pedir pelo WhatsApp
          </a>
        </div>
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-slate-500">
              Ver detalhes do erro (desenvolvimento)
            </summary>
            <pre className="mt-2 p-4 bg-slate-100 rounded text-xs overflow-auto">
              {error && error.toString()}
              <br />
              {error?.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundaryFallback;
