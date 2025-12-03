'use client'

import Link from 'next/link'
import RainbowText from '@/components/RainbowText'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-pareto-dark flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/10 rounded-2xl p-8 text-center">
        <RainbowText 
          text="Authentication Error" 
          className="text-2xl sm:text-3xl mb-6"
        />
        
        <p className="chalk-text text-pareto-light text-base mb-6">
          There was an issue completing your sign in.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/login" 
            className="block w-full bg-pareto-pink text-pareto-light px-6 py-3 rounded-xl font-display text-lg hover:opacity-80 transition-opacity"
          >
            Try Signing In Again
          </Link>
          
          <Link 
            href="/" 
            className="block w-full border-2 border-pareto-blue text-pareto-blue px-6 py-3 rounded-xl font-display text-lg hover:bg-pareto-blue hover:text-pareto-light transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}