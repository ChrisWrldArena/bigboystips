import { getData } from '@/app/lib/database'
import { Metadata } from 'next'
import Link from 'next/link'
import GetPredictions from './GetPredictions';

export const metadata: Metadata = {
  title: 'Predictions | BigBoysTips Dashboard',
  description: 'View and manage your sports predictions',
  openGraph: {
    title: 'BigBoysTips - Expert Sports Predictions & Analysis',
    description: 'Get accurate sports predictions and expert analysis. Join our community of successful bettors.',
    url: 'https://bigboystips.com',
    siteName: 'BigBoysTips',
    images: [
      {
        url: 'https://bigboystips.com/img.png',
        width: 1200,
        height: 630,
        alt: 'BigBoysTips - Expert Sports Predictions & Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BigBoysTips - Expert Sports Predictions & Analysis',
    description: 'Get accurate sports predictions and expert analysis. Join our community of successful bettors.',
    images: ['https://bigboystips.com/img.png'],
  },
  icons: {
    icon: 'https://bigboystips.com/favicon.ico',
    apple: 'https://bigboystips.com/img.png',
    other: [
      { rel: 'icon', url: 'https://bigboystips.com/img.png', sizes: '16x16' },
      { rel: 'icon', url: 'https://bigboystips.com/img.png', sizes: '32x32' },
      { rel: 'icon', url: 'https://bigboystips.com/img.png', sizes: '48x48' },
    ],
  },
  
  keywords: [
    'sports predictions',
    'expert analysis',
    'betting tips',
    'football predictions',
    'basketball predictions',
    'sports betting',
    'odds analysis',
    'winning strategies',
    'BigBoysTips'
  ],
  authors: [
    {
      name: 'Codeink Technologies',
      url: 'https://codeinktechnologies.com',
     // email: 'admin@codeinktechnologies.com'
    },
  ],
  creator: 'Codeink Technologies',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    noimageindex: false,
    noarchive: false,
    nosnippet: false,
  },

}

export default async function PredictionsPage() {
  return (
 <GetPredictions/>
  )
}
