// app/test-connection/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        const supabase = createClient()
        // ရိုးရှင်းတဲ့ query တစ်ခု လုပ်ကြည့်ပါ
        const { data, error } = await supabase
          .from('instruments')
          .select('*')
          .limit(1)

        if (error) {
          setStatus('error')
          setMessage(error.message)
        } else {
          setStatus('connected')
          setMessage('Supabase နဲ့ ချိတ်ဆက်မှု အောင်မြင်ပါတယ်!')
        }
      } catch (err) {
        setStatus('error')
        setMessage('ချိတ်ဆက်မှု မအောင်မြင်ပါ')
      }
    }
    testConnection()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      {status === 'loading' && <p>စစ်ဆေးနေပါတယ်...</p>}
      {status === 'connected' && (
        <div className="text-green-600">
          <p>✅ {message}</p>
        </div>
      )}
      {status === 'error' && (
        <div className="text-red-600">
          <p>❌ {message}</p>
        </div>
      )}
    </div>
  )
}