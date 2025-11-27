// components/ChatMessage.jsx
import { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

const ChatMessage = ({ message, isTyping = false }) => {
  const [copied, setCopied] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  
  const isUser = message.sender?._id === 'current-user' || 
                 message.sender?._id?.includes('user') ||
                 (message.sender && !message.sender._id?.includes('ai'));

  // Clean response text
  const cleanResponseText = (text) => {
    if (!text) return ''
    
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s?/g, '')
      .replace(/\d+\.\s*\*\*/g, '• ')
      .replace(/\*/g, '')
    
    return cleaned.trim()
  }

  // Typing animation effect
  useEffect(() => {
    if (isTyping && message.content) {
      setDisplayedText('')
      setShowCursor(true)
      
      const cleanedContent = cleanResponseText(message.content)
      let currentIndex = 0
      
      const typingInterval = setInterval(() => {
        if (currentIndex <= cleanedContent.length) {
          setDisplayedText(cleanedContent.slice(0, currentIndex))
          currentIndex++
        } else {
          clearInterval(typingInterval)
          setShowCursor(false)
        }
      }, 20)

      return () => clearInterval(typingInterval)
    } else if (message.content) {
      setDisplayedText(cleanResponseText(message.content))
      setShowCursor(false)
    }
  }, [message.content, isTyping])

  // Cursor blink effect
  useEffect(() => {
    if (showCursor) {
      const cursorInterval = setInterval(() => {
        setShowCursor(prev => !prev)
      }, 500)
      return () => clearInterval(cursorInterval)
    }
  }, [showCursor])

  const extractCodeBlocks = (text) => {
    if (!text) return [{ type: 'text', content: '' }]
    
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        })
      }

      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      })

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      })
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }]
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const messageParts = extractCodeBlocks(displayedText)

  return (
    <div className={`py-2 px-4 ${isUser ? 'flex justify-end' : 'flex justify-start'}`}>
      <div className={`max-w-[75%] ${isUser ? 'text-right' : 'text-left'}`}>
        
        {/* Message Bubble */}
        <div className={`
          inline-block px-4 py-3 rounded-2xl max-w-full
          ${isUser 
            ? 'bg-green-600 text-white rounded-br-md' 
            : 'bg-gray-800 text-white rounded-bl-md'
          }
        `}>
          
          {/* Message Content */}
          <div className="space-y-2">
            {messageParts.map((part, index) => {
              if (part.type === 'text') {
                return (
                  <div 
                    key={index}
                    className="leading-relaxed whitespace-pre-wrap text-sm font-['Inter']"
                    style={{ lineHeight: '2' }}
                  >
                    {part.content}
                    {showCursor && isTyping && index === messageParts.length - 1 && (
                      <span className="ml-1 w-1.5 h-4 bg-white inline-block animate-pulse"></span>
                    )}
                  </div>
                )
              } else if (part.type === 'code') {
                return (
                  <div key={index} className="relative mt-2">
                    {/* Code Header */}
                    <div className="flex items-center justify-between bg-gray-900 px-3 py-2 rounded-t-lg border-b border-gray-700">
                      <span className="text-xs text-gray-300 uppercase font-['Fira_Code']">
                        {part.language}
                      </span>
                      <button
                        onClick={() => copyToClipboard(part.content)}
                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-800 font-['Outfit']"
                      >
                        {copied ? (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Code Block */}
                    <SyntaxHighlighter
                      language={part.language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        borderRadius: '0 0 8px 8px',
                        fontSize: '12px',
                        lineHeight: '1.3',
                        fontFamily: "'Fira Code', monospace"
                      }}
                      showLineNumbers={part.content.split('\n').length > 5}
                      codeTagProps={{
                        style: {
                          fontFamily: "'Fira Code', monospace"
                        }
                      }}
                    >
                      {part.content}
                    </SyntaxHighlighter>
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatMessage