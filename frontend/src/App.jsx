// App.jsx
import { useState, useEffect, useRef } from 'react'
import { useChat } from './hooks/useChat'
import ChatMessage from './components/ChatMessage'

function App() {
  const [inputText, setInputText] = useState('')
  const [user, setUser] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
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
          !event.target.closest('.mobile-menu-button')) {
        setIsSidebarOpen(false)
        setShowMobileMenu(false)
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
      setIsSidebarOpen(false)
      setShowMobileMenu(false)
    } catch (error) {
      console.error('Failed to start new chat:', error)
    }
  }

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu)
    setIsSidebarOpen(!showMobileMenu)
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
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Mobile Menu Bar */}
      <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-gray-800/90 backdrop-blur-lg border border-gray-600 rounded-2xl px-4 py-3 shadow-2xl">
          <div className="flex items-center justify-between gap-6">
            {/* New Chat */}
            <button 
              onClick={handleNewChat}
              className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-xs">New Chat</span>
            </button>

            {/* Messages/History */}
            <button 
              onClick={toggleMobileMenu}
              className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors mobile-menu-button"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xs">Messages</span>
            </button>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-xs">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={`
          h-full flex flex-col bg-gray-900 border-r border-gray-700 transition-all duration-300 z-40
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full'}
        `}>
        
        {/* New Chat Button - Desktop */}
        <div className="p-3 shrink-0 lg:block hidden">
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
        <div className="flex-1 overflow-y-auto min-w-64">
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
                    setIsSidebarOpen(false)
                    setShowMobileMenu(false)
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 text-sm truncate mb-1"
                >
                  {message.content}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* User Info with Logout - Desktop */}
        <div className="p-3 border-t border-gray-700 shrink-0 lg:block hidden">
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

      {/* Main Chat Area - Full width when sidebar hidden */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? '' : 'max-w-full'} pb-20 lg:pb-0`}>
        
        {/* Header */}
        <header className="border-b border-gray-700 px-6 py-3 flex items-center bg-gray-900">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 mr-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors lg:block hidden"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-white">Zara AI</h1>
          </div>
        </header>

        {/* Messages Container - No Background Color */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading conversation...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center max-w-2xl px-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">Z</span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-6">Zara AI</h1>
                <p className="text-gray-400 text-lg mb-8">How can I help you today?</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {[
                    "Explain quantum computing in simple terms",
                    "How do I center a div with CSS?",
                    "Write a Python function to reverse a string",
                    "What's the difference between let and const in JavaScript?"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInputText(suggestion)}
                      className="p-4 text-left border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <div className="font-medium text-gray-300 group-hover:text-white">
                        {suggestion}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`mx-auto w-full ${isSidebarOpen ? 'max-w-4xl' : 'max-w-6xl'}`}>
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

        {/* Input Area - Small with Glass Effect */}
        <div className="p-4">
          <div className={`mx-auto ${isSidebarOpen ? 'max-w-4xl' : 'max-w-3xl'}`}>
            <div className="relative bg-gray-800/30 border border-gray-600 rounded-[35px] backdrop-blur-lg hover:border-gray-500 transition-colors">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message Zara AI..."
                className="w-full resize-none bg-transparent border-0 focus:ring-0 focus:outline-none text-white placeholder-gray-400 py-3 px-5 pr-20 text-sm"
                rows="1"
                style={{ 
                  minHeight: '20px', 
                  maxHeight: '80px',
                  lineHeight: '1.4'
                }}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                {/* Beautiful Image Upload Button */}
                <button className="p-1.5 text-gray-400 hover:text-gray-300 transition-colors hover:bg-gray-700/50 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {/* Rocket Send Button */}
                <button 
                  onClick={handleSend}
                  disabled={!inputText.trim() || isSending}
                  className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors transform hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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