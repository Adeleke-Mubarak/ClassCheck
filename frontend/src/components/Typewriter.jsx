import { useState, useEffect } from 'react'

const PHRASES = [
  "Never miss a class update again.",
  "Get real-time venue changes.",
  "Stay connected with your coursemates.",
  "No more trekking for cancelled classes.",
]

export default function Typewriter() {
  const [text, setText] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentPhrase = PHRASES[phraseIndex]
    
    let typingSpeed = isDeleting ? 30 : 60

    // If word is complete, wait a bit before deleting
    if (!isDeleting && text === currentPhrase) {
      typingSpeed = 2500
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setText(currentPhrase.substring(0, text.length + 1))
        
        if (text === currentPhrase) {
          setIsDeleting(true)
        }
      } else {
        setText(currentPhrase.substring(0, text.length - 1))
        
        if (text === '') {
          setIsDeleting(false)
          setPhraseIndex((prev) => (prev + 1) % PHRASES.length)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [text, isDeleting, phraseIndex])

  return (
    <span style={{ display: 'inline-block', minHeight: '90px' }}>
      {text}
      <span 
        style={{ 
          borderRight: '3px solid #2563EB',
          animation: 'blink 1s step-end infinite',
          marginLeft: '4px'
        }} 
      />
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  )
}
