import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
  copied: boolean
}

/** Keeps one broken screen from taking down the whole app. */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, State> {
  state: State = { error: null, copied: false }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Screen crashed:', error, info.componentStack)
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null, copied: false })
  }

  render() {
    const { error, copied } = this.state
    if (!error) return this.props.children
    const details = `${error.name}: ${error.message}\n${(error.stack ?? '').split('\n').slice(1, 6).join('\n')}\nPage: ${location.hash || '#/'}\nBrowser: ${navigator.userAgent}`
    return (
      <div className="crash" role="alert">
        <h1 className="crash-title">This screen stopped working</h1>
        <p className="crash-body">
          Something in this page broke while it was drawing. Your saved progress and settings are safe. Reload to try
          again. If it happens again, copy the details and send them to Moin.
        </p>
        <div className="crash-actions">
          <button type="button" className="btn btn-primary btn-md crash-btn" onClick={() => location.reload()}>
            Reload
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-md crash-btn"
            onClick={() => {
              navigator.clipboard
                ?.writeText(details)
                .then(() => this.setState({ copied: true }))
                .catch(() => this.setState({ copied: false }))
            }}
          >
            {copied ? 'Copied' : 'Copy details'}
          </button>
          <a className="btn btn-ghost btn-md crash-btn" href="#/">
            Go to Desk
          </a>
        </div>
        <pre className="crash-details">{details}</pre>
      </div>
    )
  }
}
