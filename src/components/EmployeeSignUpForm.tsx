import React, { useState } from 'react'
import { X, Loader2, Eye, EyeOff, AlertCircle, Shield, Users, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface EmployeeSignUpFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function EmployeeSignUpForm({ onClose, onSuccess }: EmployeeSignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Employee',
    organizationCode: '',
    passkey: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validatingOrg, setValidatingOrg] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // First, validate Organization Code and Passkey
      setValidatingOrg(true)
      console.log('Validating org with code:', formData.organizationCode, 'and passkey:', formData.passkey)
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('org_code', formData.organizationCode)
        .eq('passkey', formData.passkey)

      console.log('Organization query result:', { orgData, orgError })
      setValidatingOrg(false)

      if (orgError) {
        console.error('Organization query error:', orgError)
        throw orgError
      }

      if (!orgData || orgData.length === 0) {
        throw new Error('Invalid Organization Code or Passkey. Please verify these exact credentials with your organization owner. If you are an organization owner, check your Organization Dashboard for the correct codes.')
      }

      const organization = orgData[0]
      console.log('Found organization:', organization)

      // Create user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: formData.role
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Create user profile in users table
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: '', // Will be updated later
            role: formData.role,
            org_id: organization.id
          })

        if (userError) throw userError

        // Success
        onSuccess()
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      // Handle specific error cases with user-friendly messages
      if (error.message?.includes('Invalid Organization Code or Passkey')) {
        setError('Invalid Organization Code or Passkey. Please verify these exact credentials with your organization owner. If you are an organization owner, check your Organization Dashboard for the correct codes.')
      } else if (error.message?.includes('User already registered') || error.message?.includes('user_already_exists')) {
        setError('This email is already registered. Please log in or use a different email address.')
      } else if (error.message?.includes('Invalid email')) {
        setError('Please enter a valid email address.')
      } else if (error.message?.includes('Password')) {
        setError('Password must be at least 6 characters long.')
      } else {
        setError(error.message || 'An error occurred during sign up. Please try again.')
      }
    } finally {
      setLoading(false)
      setValidatingOrg(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl my-8 animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 sticky top-0 bg-white rounded-t-3xl">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Join Organization
            </h2>
            <p className="text-gray-600 mt-1">Sign up as a Manager or Employee</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-start space-x-3 animate-shake">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Organization Verification Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Organization Verification</h3>
                <p className="text-sm text-gray-600">Enter the credentials provided by your organization owner</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="organizationCode" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Code *
                </label>
                <input
                  type="text"
                  id="organizationCode"
                  name="organizationCode"
                  value={formData.organizationCode}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 font-mono tracking-wider"
                  placeholder="Enter organization code"
                />
              </div>

              <div>
                <label htmlFor="passkey" className="block text-sm font-semibold text-gray-700 mb-2">
                  Passkey *
                </label>
                <input
                  type="text"
                  id="passkey"
                  name="passkey"
                  value={formData.passkey}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400 font-mono tracking-wider"
                  placeholder="Enter passkey"
                />
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600">Tell us about yourself</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                >
                  <option value="Manager">Manager</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-gray-400"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
            </div>
          </div>

          {/* Role Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="font-bold text-gray-900 mb-3">Role Permissions</h4>
            {formData.role === 'Manager' ? (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Manage shop operations and inventory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>View sales reports and analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Supervise employee activities</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access to manager dashboard</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Process sales and transactions</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>View assigned shop information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Access to employee dashboard</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Track daily tasks and activities</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || validatingOrg || !formData.name || !formData.email || !formData.password || !formData.organizationCode || !formData.passkey}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                {validatingOrg ? 'Validating Organization...' : 'Creating Account...'}
              </>
            ) : (
              `Join as ${formData.role}`
            )}
          </button>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Don't have organization credentials?{' '}
              <span className="text-blue-600 font-medium">
                Contact your organization owner for the Organization Code and Passkey
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}