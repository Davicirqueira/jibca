import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

/**
 * Componente Breadcrumb para navegação hierárquica
 * 
 * @param {Array} items - Array de objetos com { label, href }
 * @param {string} current - Label do item atual (não clicável)
 * 
 * Exemplo de uso:
 * <Breadcrumb 
 *   items={[
 *     { label: 'Eventos', href: '/events' }
 *   ]}
 *   current="Detalhes do Evento"
 * />
 */
const Breadcrumb = ({ items = [], current }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
      {/* Home */}
      <Link
        to="/"
        className="flex items-center text-gray-500 hover:text-jibca-burgundy transition-colors"
        aria-label="Início"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Items intermediários */}
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <Link
            to={item.href}
            className="text-gray-500 hover:text-jibca-burgundy transition-colors font-medium"
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}

      {/* Item atual */}
      {current && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-jibca-burgundy font-semibold" aria-current="page">
            {current}
          </span>
        </>
      )}
    </nav>
  )
}

export default Breadcrumb
