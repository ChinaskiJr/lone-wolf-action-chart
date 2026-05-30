import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/components/home/HomePage'
import { CharacterWizard } from '@/components/creation/CharacterWizard'
import { AdventureSheet } from '@/components/sheet/AdventureSheet'
import { CycleTransitionWizard } from '@/components/transition/CycleTransitionWizard'

export default function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/new" element={<CharacterWizard />} />
          <Route path="/sheet/:id" element={<AdventureSheet />} />
          <Route path="/transition/:id" element={<CycleTransitionWizard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  )
}
