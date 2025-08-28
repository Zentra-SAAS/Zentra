import React from 'react'
import { Store, BarChart3, Shield, ArrowRight, Sparkles, Users, UserPlus } from 'lucide-react'

interface LandingSectionProps {
  onCreateOrganization: () => void
  onLogin: () => void
  onJoinOrganization: () => void
  onTeamLogin: () => void
}

export default function LandingSection({ onCreateOrganization, onLogin, onJoinOrganization, onTeamLogin }: LandingSectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header Navigation */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Zentra
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <button 
                  onClick={onLogin}
                  className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 font-medium text-sm"
                >
                  Owner Login
                </button>
                <button 
                  onClick={onTeamLogin}
                  className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 font-medium text-sm"
                >
                  Team Login
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onJoinOrganization}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  Join Team
                </button>
                <button
                  onClick={onCreateOrganization}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Logo with animation */}
          <div className="flex items-center justify-center space-x-4 mb-8 animate-fade-in-up">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
                <Store className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-yellow-800" />
              </div>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Zentra
            </h1>
          </div>

          {/* Headline with staggered animation */}
          <div className="space-y-4 mb-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight animate-fade-in-up animation-delay-200">
              Manage All Your Shops
            </h2>
            <h2 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in-up animation-delay-400">
              With Ease
            </h2>
          </div>

          {/* Subheading */}
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-600">
            Smart dashboards. Real-time insights. Role-based security.
            <br />
            <span className="text-blue-600 font-semibold">Everything you need to scale your business.</span>
          </p>

          {/* CTA Buttons with enhanced styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16 animate-fade-in-up animation-delay-800">
            <button
              onClick={onCreateOrganization}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-blue-500/25"
            >
              <span className="relative z-10 flex items-center justify-center space-x-2">
                <Store className="h-5 w-5" />
                <span>Create Organization</span>
              </span>
            </button>
            
            <button
              onClick={onLogin}
              className="border-2 border-blue-600 text-blue-600 px-6 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-blue-500/25"
            >
              <span className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Owner Login</span>
              </span>
            </button>

            <button
              onClick={onJoinOrganization}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl text-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-green-500/25"
            >
              <span className="flex items-center justify-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Join Team</span>
              </span>
            </button>

            <button
              onClick={onTeamLogin}
              className="border-2 border-green-600 text-green-600 px-6 py-4 rounded-2xl text-lg font-semibold hover:bg-green-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-green-500/25"
            >
              <span className="flex items-center justify-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Login</span>
              </span>
            </button>
          </div>

          {/* Features with enhanced cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 animate-fade-in-up animation-delay-1000">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Store className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multi-Shop Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage all your shops from one central dashboard with real-time synchronization
              </p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 animate-fade-in-up animation-delay-1200">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <BarChart3 className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-Time Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant analytics and performance metrics with AI-powered recommendations
              </p>
            </div>
            
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20 animate-fade-in-up animation-delay-1400">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Access</h3>
              <p className="text-gray-600 leading-relaxed">
                Role-based permissions with enterprise-grade security for your team
              </p>
            </div>
          </div>

          {/* User Types Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 max-w-4xl mx-auto mb-16 animate-fade-in-up animation-delay-1600">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Perfect for Every Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-blue-900 mb-2">Owners</h4>
                <p className="text-blue-700 text-sm">Full control over organization, shops, and team management</p>
              </div>
              
              <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-200">
                <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-green-900 mb-2">Managers</h4>
                <p className="text-green-700 text-sm">Supervise shop operations, manage inventory, and oversee staff</p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-200">
                <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="h-8 w-8 text-white" />
                </div>
                <h4 className="font-bold text-purple-900 mb-2">Employees</h4>
                <p className="text-purple-700 text-sm">Handle daily tasks, process sales, and track activities</p>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in-up animation-delay-1800">
            <p className="text-sm text-gray-500 mb-4">Trusted by 1000+ businesses worldwide</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
              <div className="w-24 h-8 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Zentra</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Smart shop management and insights platform designed for modern businesses. 
                Scale your operations with confidence.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Zentra. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}