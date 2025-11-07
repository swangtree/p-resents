'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseDemo() {
  // Track input value and status
  const [text, setText] = useState('')
  const [status, setStatus] = useState('')

  // Submit text to database
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text.trim()) {
      setStatus('Please enter some text')
      return
    }

    // Insert into Supabase
    const { error } = await supabase
      .from('messages')
      .insert([{ text }])

    if (error) {
      setStatus('Error: ' + error.message)
    } else {
      setStatus('Successfully saved!')
      setText('') // Clear input
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">Supabase Demo</h1>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        {/* Text input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter some text..."
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        {/* Submit button */}
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Save to Database
        </button>
      </form>
      

      {/* Status message */}
      {status && (
        <p className="text-sm font-medium">{status}</p>
      )}
    </div>
  )
}
