import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white p-4">
          <div className="max-w-md w-full bg-red-950/30 border border-red-500/50 rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-black text-red-500 mb-2 uppercase tracking-widest">System Failure</h2>
            <p className="text-gray-300 text-sm mb-4">The application encountered a critical error.</p>
            <div className="bg-black/50 p-3 rounded-lg border border-red-500/20 mb-6 overflow-auto max-h-32">
                <code className="text-xs text-red-300 font-mono">
                    {this.state.error?.message || 'Unknown error'}
                </code>
            </div>
            <button 
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-colors uppercase tracking-wider text-sm"
              onClick={() => window.location.reload()}
            >
              Reinitialize System
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}