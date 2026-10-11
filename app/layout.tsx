import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { SoundProvider } from '@/components/providers/SoundProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'ConceptBridge',
  description:
    'Learning app for Myanmar students — English and Philo Major exam prep.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  display: 'swap',
  subsets: ['latin'],
})

const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('conceptbridge-theme') || 'default';
    var dark = localStorage.getItem('conceptbridge-dark') === 'true';
    var root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (dark) root.classList.add('dark');
    else root.classList.remove('dark');
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${geistSans.className} min-h-dvh antialiased`}
      >
        <ThemeProvider>
          <SoundProvider>
            <AuthProvider>
              {children}
              <Toaster richColors closeButton position="top-center" />
            </AuthProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
