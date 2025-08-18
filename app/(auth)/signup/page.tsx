import { SignupForm } from '@/app/components/auth/SignupForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | BigBoysTips',
  description: 'Create your BigBoysTips account',
}

export default function SignUpPage() {
  return <SignupForm/>
}