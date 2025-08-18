import { Metadata } from 'next'
import SubscriptionSection from './SubscriptionSection'

export const metadata: Metadata = {
  title: 'Payment Settings | BigBoysTips',
  description: 'Manage your payment methods and subscription',
}

export default function PaymentsPage() {
  return (
    <SubscriptionSection />
  )
}
