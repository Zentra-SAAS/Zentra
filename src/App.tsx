import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import LandingSection from './components/LandingSection'
import OrganizationSignUpForm from './components/OrganizationSignUpForm'
import ConfirmationPage from './components/ConfirmationPage'
import OrganizationDashboard from './components/OrganizationDashboard'
import LoginForm from './components/LoginForm'
import EmployeeSignUpForm from './components/EmployeeSignUpForm'
import SuccessPage from './components/SuccessPage'
import TeamLoginForm from './components/TeamLoginForm'

type View = 'landing' | 'signup' | 'confirmation' | 'dashboard' | 'login' | 'employee-signup' | 'success' | 'team-login'

interface OrgData {
  orgCode: string
  passkey: string
  orgName: string
}

function App() {
  const [currentView, setCurrentView] = useState<View>('landing')
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [orgData, setOrgData] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Get user role to determine which dashboard to show
        getUserRole(session.user.id).then((role) => {
          setUser(session.user)
          setUserRole(role)
          setCurrentView('dashboard')
        })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        getUserRole(session.user.id).then((role) => {
          setUser(session.user)
          setUserRole(role)
          setCurrentView('dashboard')
        })
      } else {
        setUser(null)
        setUserRole('')
        setCurrentView('landing')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const getUserRole = async (userId: string): Promise<string> => {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .limit(1)

      return data && data.length > 0 ? data[0].role : ''
    } catch (error) {
      console.error('Error fetching user role:', error)
      return ''
    }
  }

  const handleCreateOrganization = () => {
    setCurrentView('signup')
  }

  const handleLogin = () => {
    setCurrentView('login')
  }

  const handleJoinOrganization = () => {
    setCurrentView('employee-signup')
  }

  const handleTeamLogin = () => {
    setCurrentView('team-login')
  }

  const handleSignUpSuccess = (newOrgData: OrgData) => {
    setOrgData(newOrgData)
    setCurrentView('confirmation')
  }

  const handleEmployeeSignUpSuccess = () => {
    setCurrentView('success')
  }

  const handleLoginSuccess = (loggedInUser: any, role?: string) => {
    setUser(loggedInUser)
    if (role) {
      setUserRole(role)
    }
    setCurrentView('dashboard')
  }

  const handleContinueToDashboard = () => {
    setCurrentView('dashboard')
  }

  const handleContinueToLogin = () => {
    setCurrentView('team-login')
  }

  const handleBackToLanding = () => {
    setCurrentView('landing')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (currentView === 'dashboard' && user) {
    // Show appropriate dashboard based on user role
    if (userRole === 'Owner') {
      return <OrganizationDashboard user={user} />
    } else {
      // For now, show a placeholder for Manager/Employee dashboards
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome, {userRole}!
            </h1>
            <p className="text-gray-600 mb-8">
              Your {userRole.toLowerCase()} dashboard is coming soon.
            </p>
            <button
              onClick={() => supabase.auth.signOut()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )
    }
  }

  if (currentView === 'confirmation' && orgData) {
    return (
      <ConfirmationPage
        orgData={orgData}
        onContinue={handleContinueToDashboard}
      />
    )
  }

  if (currentView === 'signup') {
    return (
      <OrganizationSignUpForm
        onClose={handleBackToLanding}
        onSuccess={handleSignUpSuccess}
      />
    )
  }

  if (currentView === 'login') {
    return (
      <LoginForm
        onClose={handleBackToLanding}
        onSuccess={handleLoginSuccess}
      />
    )
  }

  if (currentView === 'employee-signup') {
    return (
      <EmployeeSignUpForm
        onClose={handleBackToLanding}
        onSuccess={handleEmployeeSignUpSuccess}
      />
    )
  }

  if (currentView === 'success') {
    return (
      <SuccessPage
        onContinueToLogin={handleContinueToLogin}
      />
    )
  }

  if (currentView === 'team-login') {
    return (
      <TeamLoginForm
        onClose={handleBackToLanding}
        onSuccess={handleLoginSuccess}
      />
    )
  }

  return (
    <LandingSection 
      onCreateOrganization={handleCreateOrganization}
      onLogin={handleLogin}
      onJoinOrganization={handleJoinOrganization}
      onTeamLogin={handleTeamLogin}
    />
  )
}

export default App