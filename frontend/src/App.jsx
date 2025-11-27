// App.jsx
import { useState, useEffect, useRef } from 'react'
import { useChat } from './hooks/useChat'
import ChatMessage from './components/ChatMessage'

function App() {
  const [inputText, setInputText] = useState('')
  const [user, setUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  
  const { messages, isLoading, isSending, fetchChatHistory, sendMessage, clearChat } = useChat()
  
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const sidebarRef = useRef(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchChatHistory()
  }, [])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 && 
          sidebarRef.current && 
          !sidebarRef.current.contains(event.target) &&
          !event.target.closest('.hamburger-menu')) {
        setIsSidebarOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 80) + 'px'
    }
  }, [inputText])

  // Typing animation for AI messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    
    if (lastMessage && 
        !lastMessage.sender?._id?.includes('user') && 
        !lastMessage.sender?._id?.includes('current-user')) {
      
      setIsTyping(true)
      
      const textLength = lastMessage.content?.length || 0
      const typingDuration = Math.max(textLength * 20, 1500)
      
      const timer = setTimeout(() => {
        setIsTyping(false)
      }, typingDuration)
      
      return () => clearTimeout(timer)
    }
  }, [messages])

  const handleSend = async () => {
    if (!inputText.trim()) return
    
    try {
      setIsTyping(false)
      await sendMessage(inputText)
      setInputText('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const handleNewChat = async () => {
    try {
      setIsTyping(false)
      await clearChat()
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      }
    } catch (error) {
      console.error('Failed to start new chat:', error)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  // Format date for sidebar
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Group messages by date for sidebar
  const groupedMessages = messages.reduce((groups, message) => {
    if (message.sender?._id === 'current-user') {
      const date = new Date(message.createdAt).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    }
    return groups
  }, {})

  return (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Proper ChatGPT Style */}
      <div 
        ref={sidebarRef}
        className={`
          fixed lg:relative h-full flex flex-col bg-gray-900 border-r border-gray-700 z-40
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-64'}
        `}
      >
        {/* Sidebar Content */}
        <div className="flex-1 flex flex-col w-64">
          {/* New Chat Button */}
          <div className="p-3 shrink-0">
            <button 
              onClick={handleNewChat}
              className="w-full p-3 text-left border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-3 text-white text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {Object.entries(groupedMessages).map(([date, dateMessages]) => (
              <div key={date} className="px-3 py-2">
                <div className="text-xs text-gray-500 uppercase mb-2 px-2">
                  {formatDate(date)}
                </div>
                {dateMessages.slice(-10).map((message, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInputText(message.content)
                      if (window.innerWidth < 1024) {
                        setIsSidebarOpen(false)
                      }
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 text-sm truncate mb-1"
                  >
                    {message.content}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* User Info with Logout */}
          <div className="p-3 border-t border-gray-700 shrink-0">
            <div className="flex items-center justify-between p-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{user?.name || 'User'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Header - Fixed */}
        <header className="border-b border-gray-700 px-6 py-4 bg-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - Mobile Only */}
            <button 
              onClick={toggleSidebar}
              className="hamburger-menu p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <h1 className="text-xl font-bold text-white">Zara AI</h1>
          </div>
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gray-900">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full px-4">
              <div className="text-center max-w-2xl w-full">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-3xl font-bold">Z</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Zara AI</h1>
                <p className="text-gray-400 text-lg mb-8">How can I help you today?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {[
                    "Explain quantum computing in simple terms",
                    "How do I center a div with CSS?",
                    "Write a Python function to reverse a string",
                    "What's the difference between let and const in JavaScript?"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(suggestion)}
                      className="p-4 text-left border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors group bg-gray-900/50"
                    >
                      <div className="font-medium text-gray-300 group-hover:text-white text-sm">
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto py-4">
              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1
                const isAIMessage = !message.sender?._id?.includes('user') && 
                                   !message.sender?._id?.includes('current-user')
                const shouldShowTyping = isLastMessage && isTyping && isAIMessage
                
                return (
                  <ChatMessage 
                    key={message._id || `message-${index}`} 
                    message={message}
                    isTyping={shouldShowTyping}
                  />
                )
              })}
              
              {isSending && (
                <div className="py-4 px-6">
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - ChatGPT Style */}
        <div className="bg-gray-900 shrink-0">
          <div className="max-w-3xl mx-auto px-4 pb-6">
            {/* Input Container */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Zara AI..."
                className="w-full resize-none bg-gray-700 border border-gray-600 focus:border-gray-500 focus:ring-0 focus:outline-none text-white placeholder-gray-400 py-3 px-4 pr-16 text-sm rounded-full transition-colors [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                rows="1"
                style={{ 
                  minHeight: '24px', 
                  maxHeight: '120px',
                  lineHeight: '1.4'
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors hover:bg-gray-600 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-xs text-center text-gray-500 mt-2">
              Zara AI can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App