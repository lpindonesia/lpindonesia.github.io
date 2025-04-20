import { useState, useEffect } from 'react'
import Papa from 'papaparse'

interface TriviaItem {
  id: number
  trivia_true: string
  source: string
  media: string
}

export default function HuntingTrivia() {
  const [triviaData, setTriviaData] = useState<TriviaItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTrivia, setCurrentTrivia] = useState<TriviaItem | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data/the_hunting_trivia_db.csv')

        if (!response.ok) {
          throw new Error(
            `Failed to fetch CSV: ${response.status} ${response.statusText}`
          )
        }

        const csvText = await response.text()

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true, // Automatically convert numbers
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data as TriviaItem[]
            setTriviaData(data)

            const params = new URLSearchParams(window.location.search)
            const requestedId = params.get('id')
              ? parseInt(params.get('id')!, 10)
              : null

            if (requestedId) {
              const requestedTrivia = data.find(
                (trivia) => trivia.id === requestedId
              )
              if (requestedTrivia) {
                setCurrentTrivia(requestedTrivia)
              } else {
                selectRandomTrivia(data)
              }
            } else {
              selectRandomTrivia(data)
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

  const selectRandomTrivia = (data: TriviaItem[] = triviaData) => {
    if (data.length === 0) return

    const viewedTriviaIds = JSON.parse(
      localStorage.getItem('viewedTriviaIds') || '[]'
    )

    const unviewedTrivias = data.filter(
      (trivia) => !viewedTriviaIds.includes(trivia.id)
    )

    let newTrivia: TriviaItem

    if (unviewedTrivias.length === 0) {
      localStorage.setItem('viewedTriviaIds', '[]')
      const randomIndex = Math.floor(Math.random() * data.length)
      newTrivia = data[randomIndex]
    } else {
      const randomIndex = Math.floor(Math.random() * unviewedTrivias.length)
      newTrivia = unviewedTrivias[randomIndex]

      localStorage.setItem(
        'viewedTriviaIds',
        JSON.stringify([...viewedTriviaIds, newTrivia.id])
      )
    }

    setCurrentTrivia(newTrivia)
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-48'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d60f0f]'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className='bg-red-100 border border-red-400 text-[#d60f0f] px-4 py-3 rounded relative'
        role='alert'
      >
        <strong className='font-bold'>Error:</strong>
        <span className='block sm:inline'> {error}</span>
      </div>
    )
  }

  return (
    <div className='max-w-xs md:max-w-md lg:max-w-lg mx-auto p-6 bg-stone-100 rounded-lg shadow-md'>
      <h2 className='text-2xl text-center font-bold text-[#d60f0f] mb-6'>
        Trivia #{currentTrivia?.id}
      </h2>

      {currentTrivia ? (
        <div className='bg-white p-4 rounded shadow-sm'>
          {currentTrivia.media && (
            <>
              {currentTrivia.media.match(/\.(jpeg|jpg|gif|png)$/) && (
                <img
                  src={currentTrivia.media}
                  alt='Trivia media'
                  className='w-full max-w-md h-auto rounded-md object-cover mx-auto mb-4'
                  loading='lazy'
                />
              )}
            </>
          )}
          <p className='text-lg font-medium'>{currentTrivia.trivia_true}</p>

          {currentTrivia.source && (
            <div className='mt-4 text-sm text-gray-600 truncate'>
              <span className='font-semibold'>Sumber:</span>{' '}
              {currentTrivia.source.match(/^https?:\/\//i) ? (
                <a
                  href={currentTrivia.source}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-blue-500 hover:underline'
                >
                  {currentTrivia.source}
                </a>
              ) : (
                currentTrivia.source
              )}
            </div>
          )}
        </div>
      ) : (
        <p className='text-gray-700'>No trivia available.</p>
      )}

      <button
        onClick={() => selectRandomTrivia()}
        className='mt-6 px-4 py-2 w-full bg-[#d60f0f] text-white rounded hover:bg-[#d60f0f] transition-colors'
      >
        Next Trivia
      </button>
    </div>
  )
}
