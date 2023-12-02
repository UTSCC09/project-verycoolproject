import { Inter } from 'next/font/google'
import StoreProvider from "../store/provider"

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Act it Out',
  description: 'Its Fun',
}

export default function RootLayout({ children }) {
  return (
    <StoreProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </StoreProvider>
  )
}
