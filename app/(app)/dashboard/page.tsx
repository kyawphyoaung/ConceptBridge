import { DashboardView } from '@/components/dashboard/DashboardView'

export const instant = false

/**
 * Dashboard route — Server Component shell; data UI lives in DashboardView.
 */
export default function DashboardPage() {
  return <DashboardView />
}
