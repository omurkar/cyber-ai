import React from 'react'
import { Button } from './Button'

type State = { hasError: boolean, error?: any }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
    state: State = { hasError: false }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error }
    }
    handleRetry = () => this.setState({ hasError: false, error: undefined })
    render() {
        if (this.state.hasError) {
            return (
                <div className="card">
                    <div className="card-title">Something went wrong</div>
                    <div className="text-sm text-gray-400 mb-3">{String(this.state.error)}</div>
                    <Button onClick={this.handleRetry}>Retry</Button>
                </div>
            )
        }
        return this.props.children
    }
}


