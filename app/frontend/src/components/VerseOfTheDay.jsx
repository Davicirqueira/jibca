import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { X, Heart, Sparkles } from 'lucide-react'

// Lista de versículos bíblicos inspiradores
const verses = [
  {
    text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz e não de mal, para vos dar o fim que esperais.",
    reference: "Jeremias 29:11"
  },
  {
    text: "Tudo posso naquele que me fortalece.",
    reference: "Filipenses 4:13"
  },
  {
    text: "O Senhor é o meu pastor; nada me faltará.",
    reference: "Salmos 23:1"
  },
  {
    text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.",
    reference: "Salmos 37:5"
  },
  {
    text: "Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias.",
    reference: "Isaías 40:31"
  },
  {
    text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.",
    reference: "Romanos 8:28"
  },
  {
    text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus.",
    reference: "Isaías 41:10"
  },
  {
    text: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha.",
    reference: "1 Coríntios 13:4"
  },
  {
    text: "Lançando sobre ele toda a vossa ansiedade, porque ele tem cuidado de vós.",
    reference: "1 Pedro 5:7"
  },
  {
    text: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.",
    reference: "Filipenses 4:4"
  },
  {
    text: "A tua palavra é lâmpada para os meus pés e luz para o meu caminho.",
    reference: "Salmos 119:105"
  },
  {
    text: "Porque onde estiverem dois ou três reunidos em meu nome, aí estou eu no meio deles.",
    reference: "Mateus 18:20"
  },
  {
    text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.",
    reference: "Mateus 11:28"
  },
  {
    text: "O Senhor abençoe-te e te guarde; o Senhor faça resplandecer o seu rosto sobre ti.",
    reference: "Números 6:24-25"
  },
  {
    text: "Buscai primeiro o reino de Deus, e a sua justiça, e todas estas coisas vos serão acrescentadas.",
    reference: "Mateus 6:33"
  }
]

const VerseOfTheDay = () => {
  const { isAuthenticated } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [currentVerse, setCurrentVerse] = useState(null)

  // Obter versículo do dia baseado na data
  const getTodaysVerse = () => {
    const today = new Date()
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24)
    const verseIndex = dayOfYear % verses.length
    return verses[verseIndex]
  }

  // Verificar se deve mostrar o modal hoje
  const shouldShowToday = () => {
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem('jibca_verse_last_shown')
    return lastShown !== today
  }

  useEffect(() => {
    if (isAuthenticated && shouldShowToday()) {
      setCurrentVerse(getTodaysVerse())
      // Mostrar após um pequeno delay para melhor UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isAuthenticated])

  const handleClose = () => {
    setIsVisible(false)
    // Marcar como mostrado hoje
    const today = new Date().toDateString()
    localStorage.setItem('jibca_verse_last_shown', today)
  }

  if (!isVisible || !currentVerse) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full mx-4 animate-fade-in border border-gray-100">
        {/* Header Corporativo */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-8 rounded-t-3xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Versículo do Dia</h2>
            <p className="text-slate-200 text-sm font-medium">
              Reflexão Espiritual Diária
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
          </div>

          <blockquote className="text-gray-800 text-lg leading-relaxed mb-6 font-serif text-center italic">
            "{currentVerse.text}"
          </blockquote>
          
          <div className="text-center mb-6">
            <cite className="text-blue-600 font-bold text-lg">
              {currentVerse.reference}
            </cite>
          </div>

          {/* Elementos decorativos */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>

          <div className="text-center">
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Continuar
            </button>
            
            <p className="text-xs text-gray-500 mt-4 font-medium">
              Que esta palavra abençoe seu dia na JIBCA
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerseOfTheDay