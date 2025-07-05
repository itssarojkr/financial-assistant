import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test/utils/test-utils'
import App from '@/App'

// Mock the Index component since it's the main page
vi.mock('@/pages/Index', () => ({
  default: () => <div data-testid="index-page">Index Page</div>
}))

describe('App', () => {
  it('renders the main application', () => {
    render(<App />)
    
    expect(screen.getByTestId('index-page')).toBeInTheDocument()
  })



  it('renders without crashing', () => {
    expect(() => render(<App />)).not.toThrow()
  })
}) 