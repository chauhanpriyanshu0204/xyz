import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Caveat, Patrick_Hand } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const patrickHand = Patrick_Hand({
  variable: '--font-patrick-hand',
  weight: '400',
  subsets: ['latin'],
})
const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'My Habit Diary',
  description: 'A daily habit tracker that lives in your notebook.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f4ecd8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${patrickHand.variable} ${caveat.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <Script id="onesignal-init" strategy="afterInteractive">
          {`
            window.OneSignalDeferred = window.OneSignalDeferred || [];
            OneSignalDeferred.push(async function (OneSignal) {
              await OneSignal.init({
                appId: "b6633067-cce4-4df2-840f-ed508120179a",
                allowLocalhostAsSecureOrigin: true,
              });
            });
          `}
        </Script>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
