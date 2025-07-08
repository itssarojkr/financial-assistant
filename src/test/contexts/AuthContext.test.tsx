import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  }
}))

// Test component to access auth context
const TestComponent = () => {
  const { user, loading, signOut } = useAuth()
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user ? user.email : 'No User'}</div>
      <button onClick={signOut} data-testid="signout-btn">Sign Out</button>
    </div>
  )
}

const renderWithAuth = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('provides initial loading state', () => {
    renderWithAuth(<TestComponent />)
    
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading')
  })

  it('provides user state when no user is logged in', async () => {
    renderWithAuth(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('No User')
  })

  it('provides sign out functionality', async () => {
    renderWithAuth(<TestComponent />)
    
    const signOutBtn = screen.getByTestId('signout-btn')
    expect(signOutBtn).toBeInTheDocument()
    
    fireEvent.click(signOutBtn)
    
    // Should call Supabase signOut
    const { supabase } = await import('@/integrations/supabase/client')
    expect(supabase.auth.signOut).toHaveBeenCalled()
  })

  it('handles auth state changes', async () => {
    const { supabase } = await import('@/integrations/supabase/client')
    
    // Mock auth state change
    let authCallback: (() => void) | null = null;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authCallback = callback
      return { 
        data: { 
          subscription: { 
            id: 'test-id',
            callback: vi.fn(),
            unsubscribe: vi.fn() 
          } 
        } 
      }
    })
    
    renderWithAuth(<TestComponent />)
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
    
    // Simulate auth state change
    if (authCallback) {
      authCallback('SIGNED_IN', { 
        user: { 
          id: 'user123',
          email: 'test@example.com',
          created_at: '2024-01-01T00:00:00Z'
        } 
      })
    }
    
    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('handles auth errors gracefully', async () => {
    const { supabase } = await import('@/integrations/supabase/client')
    
    // Mock auth error
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: { message: 'Auth error' } as Error
    })
    
    renderWithAuth(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading')
    })
    
    expect(screen.getByTestId('user')).toHaveTextContent('No User')
  })
}) 