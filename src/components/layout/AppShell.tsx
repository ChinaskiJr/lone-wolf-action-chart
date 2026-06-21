import type { ReactNode } from 'react'
import { Header } from './Header'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a]">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
