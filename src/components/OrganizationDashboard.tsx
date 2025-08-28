import React, { useState, useEffect } from 'react'
import { 
  Store, 
  Users, 
  Copy, 
  LogOut, 
  Plus, 
  Shield, 
  Key, 
  Building, 
  CheckCircle,
  UserPlus,
  Settings,
  BarChart3,
  Bell
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface OrganizationDashboardProps {
  user: any
}

interface OrganizationData {
  id: string
  name: string
  org_code: string
  passkey: string
  number_of_shops: number
  created_at: string
}

interface DashboardStats {
  totalShops: number
  totalEmployees: number
  totalManagers: number
}

export default function OrganizationDashboard({ user }: OrganizationDashboardProps) {
  const [organization, setOrganization] = useState<OrganizationData | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    totalShops: 0,
    totalEmployees: 0,
    totalManagers: 0
  })
  const [loading, setLoading] = useState(true)
  const [copiedOrgCode, setCopiedOrgCode] = useState(false)
  const [copiedPasskey, setCopiedPasskey] = useState(false)

  useEffect(() => {
    fetchOrganizationData()
  }, [])

  const fetchOrganizationData = async () => {
    try {
      // Get user's organization data
      const { data: userData } = await supabase
        .from('users')
        .select('org_id, organizations(*)')
        .eq('id', user.id)
        .limit(1)

      const userRecord = userData && userData.length > 0 ? userData[0] : null
      
      if (userRecord?.organizations) {
        setOrganization(userRecord.organizations)

        // Get dashboard stats
        const orgId = userRecord.organizations.id

        // Get shops count
        const { count: shopsCount } = await supabase
          .from('shops')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)

        // Get total employees count
        const { count: totalEmployeesCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)

        // Get managers count
        const { count: managersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('role', 'Manager')

        setStats({
          totalShops: shopsCount || 0,
          totalEmployees: (totalEmployeesCount || 0) - 1, // Subtract 1 for the owner
          totalManagers: managersCount || 0
        })
      }
    } catch (error) {
      console.error('Error fetching organization data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const copyToClipboard = async (text: string, type: 'orgCode' | 'passkey') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'orgCode') {
        setCopiedOrgCode(true)
        setTimeout(() => setCopiedOrgCode(false), 2000)
      } else {
        setCopiedPasskey(true)
        setTimeout(() => setCopiedPasskey(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Owner'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your organization...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Organization not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Store className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Zentra
                </h1>
                <p className="text-sm text-gray-600 font-medium">Organization Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Welcome back,</p>
                  <p className="text-sm text-gray-600">{userName}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-xl hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome, {userName}
          </h2>
          <p className="text-xl text-gray-600">
            Organization: <span className="font-semibold text-blue-600">{organization.name}</span>
          </p>
        </div>

        {/* Organization Credentials Section */}
        <div className="mb-8 animate-fade-in-up animation-delay-200">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Organization Credentials
                </h3>
                <p className="text-gray-600">Share these with your team members to join your organization</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Organization Code */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Organization Code</h4>
                    <p className="text-sm text-gray-600">Required for team signup</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-lg tracking-wider">
                    {organization.org_code}
                  </div>
                  <button
                    onClick={() => copyToClipboard(organization.org_code, 'orgCode')}
                    className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold transform hover:scale-105 ${
                      copiedOrgCode 
                        ? 'bg-green-600 text-white' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Copy className="h-5 w-5" />
                    <span>{copiedOrgCode ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Passkey */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Key className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Passkey</h4>
                    <p className="text-sm text-gray-600">Security key for verification</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 font-mono text-lg tracking-wider">
                    {organization.passkey}
                  </div>
                  <button
                    onClick={() => copyToClipboard(organization.passkey, 'passkey')}
                    className={`px-4 py-3 rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold transform hover:scale-105 ${
                      copiedPasskey 
                        ? 'bg-green-600 text-white' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <Copy className="h-5 w-5" />
                    <span>{copiedPasskey ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-800 mb-3 text-lg">📋 Team Onboarding Instructions</h4>
                  <div className="space-y-2 text-amber-700">
                    <p className="font-medium">Share both the Organization Code and Passkey with your team members:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Managers can use these credentials to join and manage shops</li>
                      <li>Employees can use these credentials to join and access their assigned shops</li>
                      <li>Keep these credentials secure and only share with trusted team members</li>
                    </ul>
                  </div>
                  <div className="mt-4 p-4 bg-amber-100 rounded-xl">
                    <p className="text-sm text-amber-800 font-medium">
                      🔒 Security Tip: These credentials provide access to your organization. Never share them publicly or on social media.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up animation-delay-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Shops</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalShops}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Store className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up animation-delay-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Employees</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalEmployees}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up animation-delay-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Managers</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalManagers}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 animate-fade-in-up animation-delay-1000">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Plus className="h-6 w-6 text-blue-600 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-blue-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <UserPlus className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Add New Employee</p>
                  <p className="text-sm text-gray-600">Invite team members to join</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-green-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-green-200">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <Store className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Add New Shop</p>
                  <p className="text-sm text-gray-600">Expand your business</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-purple-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">View Analytics</p>
                  <p className="text-sm text-gray-600">Track performance</p>
                </div>
              </button>
              
              <button className="w-full flex items-center space-x-4 p-4 text-left hover:bg-gray-50 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Organization Settings</p>
                  <p className="text-sm text-gray-600">Manage preferences</p>
                </div>
              </button>
            </div>
          </div>

          {/* Getting Started Checklist */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 animate-fade-in-up animation-delay-1200">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              Getting Started Checklist
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Create organization</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Set up first shop</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Access organization credentials</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-gray-500">Invite team members</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-gray-500">Set up inventory management</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
                <span className="text-gray-500">Configure payment methods</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                🎉 You're 50% complete! Next step: Invite your team members using the credentials above.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}