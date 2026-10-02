import { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext.jsx'
import { logDevError } from '../lib/devLog.js'
import { Button } from './ui/Button.jsx'
import { Card } from './ui/Card.jsx'

function ErrorFallback({ onReset }) {
  const { t } = useLanguage()

  const handleReload = () => {
    if (onReset) onReset()
    window.location.reload()
  }

  return (
    <div
      role="alert"
      className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[50vh] w-full"
    >
      <Card className="max-w-md w-full p-8 text-center border-brick/30 bg-bg-panel shadow-sm">
        <div className="w-12 h-12 rounded-full bg-brick/10 border border-brick/30 flex items-center justify-center text-brick mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display font-semibold text-lg text-text-primary mb-2">
          {t('common.crashTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {t('common.crashDesc')}
        </p>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleReload}
          className="w-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('common.reload')}</span>
        </Button>
      </Card>
    </div>
  )
}

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    logDevError('ErrorBoundary', {
      error,
      componentStack: errorInfo?.componentStack,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      return <ErrorFallback onReset={this.handleReset} />
    }

    return this.props.children
  }
}
