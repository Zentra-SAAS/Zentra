import React, { useState } from 'react'
import { CheckCircle, Copy, ArrowRight, Shield, Users, Sparkles } from 'lucide-react'

interface ConfirmationPageProps {
  orgData: {
    orgCode: string
    passkey: string
    orgName: string
  }
  onContinue: () => void
}

export default function ConfirmationPage({ orgData, onContinue }: ConfirmationPageProps) {
  const [copiedOrgCode, setCopiedOrgCode] = useState(false)
  const [copiedPasskey, setCopiedPasskey] = useState(false)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-4xl p-8 animate-scale-in border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Success Icon with animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in shadow-2xl">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-4 w-4 text-yellow-800" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 animate-fade-in-up">
            Organization Created Successfully!
          </h1>
          <p className="text-xl text-gray-600 animate-fade-in-up animation-delay-200">
            Welcome to Zentra! Your organization <span className="font-semibold text-blue-600">"{orgData.orgName}"</span> is ready to go.
          </p>
        </div>

        {/* Credentials Section */}
        <div className="space-y-8 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 animate-fade-in-up animation-delay-400">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Your Organization Credentials
              </h3>
            </div>
            
            {/* Organization Code */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Organization Code
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 font-mono text-lg tracking-wider shadow-inner">
                  {orgData.orgCode}
                </div>
                <button
                  onClick={() => copyToClipboard(orgData.orgCode, 'orgCode')}
                  className={`px-6 py-4 rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold transform hover:scale-105 ${
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Passkey
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-white border-2 border-gray-200 rounded-xl px-6 py-4 font-mono text-lg tracking-wider shadow-inner">
                  {orgData.passkey}
                </div>
                <button
                  onClick={() => copyToClipboard(orgData.passkey, 'passkey')}
                  className={`px-6 py-4 rounded-xl transition-all duration-200 flex items-center space-x-2 font-semibold transform hover:scale-105 ${
                    copiedPasskey 
                      ? 'bg-green-600 text-white' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Copy className="h-5 w-5" />
                  <span>{copiedPasskey ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8 animate-fade-in-up animation-delay-600">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-amber-800 mb-3 text-lg">🔒 Important Security Notice</h4>
                <p className="text-amber-700 leading-relaxed">
                  Share this Organization Code and Passkey <strong>ONLY</strong> with your trusted staff members. 
                  They will need both credentials to join your organization. Keep these credentials secure and 
                  never share them publicly or on social media.
                </p>
                <div className="mt-4 p-4 bg-amber-100 rounded-xl">
                  <p className="text-sm text-amber-800 font-medium">
                    💡 Pro Tip: Save these credentials in a secure password manager or write them down in a safe place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center animate-fade-in-up animation-delay-800">
          <button
            onClick={onContinue}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-3 mx-auto"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <p className="text-gray-500 mt-4 text-sm">
            You can always find these credentials in your organization settings
          </p>
        </div>
      </div>
    </div>
  )
}