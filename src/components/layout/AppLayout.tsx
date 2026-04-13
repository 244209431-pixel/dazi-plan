import { ReactNode } from 'react'
import BottomNav from './BottomNav'
import Navbar from './Navbar'

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
