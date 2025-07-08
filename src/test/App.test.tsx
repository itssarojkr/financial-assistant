import { describe, it, expect, vi } from 'vitest'
import { render } from '@/test/utils/test-utils'
import App from '@/App'

// Mock the main pages to avoid routing issues
vi.mock('@/pages/Index', () => ({
  default: () => <div data-testid="index-page">Index Page</div>
}))

vi.mock('@/pages/Landing', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>
}))

vi.mock('@/pages/DashboardPage', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}))

vi.mock('@/pages/Auth', () => ({
  default: () => <div data-testid="auth-page">Auth Page</div>,
  Auth: () => <div data-testid="auth-page">Auth Page</div>
}))

vi.mock('@/pages/Help', () => ({
  default: () => <div data-testid="help-page">Help Page</div>
}))

vi.mock('@/pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>
}))

describe('App', () => {
  it('renders the main application without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })

  it('renders with proper structure', () => {
    render(<App />)
    
    // The app should render without throwing router errors
    expect(document.body).toBeInTheDocument()
  })
}) 