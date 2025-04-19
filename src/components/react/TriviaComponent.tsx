// src/components/HuntingTrivia.tsx
import { useState, useEffect } from 'react'
import Papa from 'papaparse'

// Define the structure of our trivia data
interface TriviaItem {
  id: number
  trivia_true: string
  source: string
  media: string
}

export default function HuntingTrivia() {
  // State to store our trivia data
  const [triviaData, setTriviaData] = useState<TriviaItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTrivia, setCurrentTrivia] = useState<TriviaItem | null>(null)

  useEffect(() => {
    // Function to fetch and parse the CSV
    const fetchData = async () => {
      try {
        // Fetch the CSV file
        const response = await fetch('/data/the_hunting_trivia_db.csv')

        if (!response.ok) {
          throw new Error(
            `Failed to fetch CSV: ${response.status} ${response.statusText}`
          )
        }

        const csvText = await response.text()

        // Parse the CSV using Papaparse
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true, // Automatically convert numbers
          skipEmptyLines: true,
          complete: (results) => {
            // Type assertion to ensure results.data matches our interface
            const data = results.data as TriviaItem[]
            setTriviaData(data)

            // Set a random trivia to display initially
            if (data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length)
              setCurrentTrivia(data[randomIndex])
            }

            setLoading(false)
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error)
            setError('Failed to parse the trivia data. Please try again later.')
            setLoading(false)
          },
        })
      } catch (err) {
        console.error('Error fetching CSV:', err)
        setError(
          'Failed to load the trivia data. Please check if the file exists in the public/data directory.'
        )
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Function to get a new random trivia
  const getRandomTrivia = () => {
    if (triviaData.length > 0) {
      const randomIndex = Math.floor(Math.random() * triviaData.length)
      setCurrentTrivia(triviaData[randomIndex])
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-48'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-800'></div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div
        className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative'
        role='alert'
      >
        <strong className='font-bold'>Error:</strong>
        <span className='block sm:inline'> {error}</span>
      </div>
    )
  }

  // Render trivia
  return (
    <div className='max-w-2xl mx-auto p-6 bg-stone-100 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-green-800 mb-6'>Hunting Trivia</h2>

      {currentTrivia ? (
        <div className='bg-white p-6 rounded shadow-sm'>
          <p className='text-lg font-medium mb-4'>
            {currentTrivia.trivia_true}
          </p>

          <div className='text-sm text-gray-600 mb-4'>
            <span className='font-semibold'>Source:</span>{' '}
            {currentTrivia.source}
          </div>

          {currentTrivia.media && (
            <div className='text-sm text-gray-600 mb-4'>
              <span className='font-semibold'>Media:</span>{' '}
              {currentTrivia.media}
            </div>
          )}

          <div className='text-xs text-gray-500 mb-4'>
            Trivia ID: {currentTrivia.id}
          </div>
        </div>
      ) : (
        <p className='text-gray-700'>No trivia available.</p>
      )}

      <button
        onClick={getRandomTrivia}
        className='mt-6 px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors'
      >
        Next Trivia
      </button>
    </div>
  )
}
