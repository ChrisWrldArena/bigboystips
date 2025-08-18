import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/app/components/shared/Card'

export default function PredictionsPage() {
  return (
    <div className="container w-full mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Latest Predictions</h1>
        <div className="flex gap-4">
          <select className="rounded-md border border-gray-300 p-2">
            <option value="">All Leagues</option>
            <option value="premier-league">Premier League</option>
            <option value="la-liga">La Liga</option>
            <option value="bundesliga">Bundesliga</option>
          </select>
          <select className="rounded-md border border-gray-300 p-2">
            <option value="">All Types</option>
            <option value="free">Free</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample predictions - will be dynamic */}        <Card hoverable className="h-full">
          <CardContent>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Premier League</h3>
                <p className="text-sm text-gray-600">Manchester United vs Liverpool</p>
              </div>
              <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">
                Free
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Tip: Over 2.5 Goals</p>
              <p className="text-sm text-gray-600">
                Match starts in 2 hours
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Link 
              href="/predictions/1"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
            >
              View Details 
              <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </CardFooter>
        </Card>

        {/* Add more prediction cards */}
      </div>

      <div className="mt-8 flex justify-center">
        <nav className="flex items-center gap-2">
          <button className="px-3 py-1 rounded border">←</button>
          <span className="px-3 py-1 rounded bg-primary-600 text-white">1</span>
          <span className="px-3 py-1 rounded hover:bg-gray-100">2</span>
          <span className="px-3 py-1 rounded hover:bg-gray-100">3</span>
          <button className="px-3 py-1 rounded border">→</button>
        </nav>
      </div>
    </div>
  )
}
