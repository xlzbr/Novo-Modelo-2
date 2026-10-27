import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou erro não tratado:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearDataAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignora erro
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen w-full bg-[#F6F7F9] dark:bg-[#0B132B] flex items-center justify-center p-4 antialiased text-slate-800 dark:text-slate-100">
          <div className="max-w-md w-full bg-white dark:bg-[#14223D] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-white/10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-200 dark:border-amber-800/40">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
              Recuperação do Folium
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Ocorreu uma instabilidade pontual na interface ou no suporte gráfico. Seus dados acadêmicos estão preservados com segurança.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-left border border-slate-200 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                  Detalhes Técnicos
                </span>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-300 break-words line-clamp-3">
                  {this.state.error.message || 'Erro de execução'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 bg-[#203A65] hover:bg-[#182C4F] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearDataAndReload}
                className="py-2.5 px-4 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Restaura os dados iniciais do Folium"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Restaurar Padrão</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
