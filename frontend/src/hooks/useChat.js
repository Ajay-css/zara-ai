// hooks/useChat.js
import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

const sendMessageAPI = async (message, token) => {
  const response = await fetch(`${API_BASE_URL}/chat/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ content: message, messageType: 'text' })
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Failed to send message')
  }
  return response.json()
}

const fetchChatHistoryAPI = async (token) => {
  const response = await fetch(`${API_BASE_URL}/chat/history`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!response.ok) throw new Error('Failed to load chat history')
  return response.json()
}

const clearChatAPI = async (token) => {
  const response = await fetch(`${API_BASE_URL}/chat/clear`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!response.ok) throw new Error('Failed to clear chat')
  return response.json()
}

const getAIModelsAPI = async (token) => {
  const response = await fetch(`${API_BASE_URL}/chat/models`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  if (!response.ok) throw new Error('Failed to load AI models')
  return response.json()
}

const switchAIModelAPI = async (model, token) => {
  const response = await fetch(`${API_BASE_URL}/chat/switch-model`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ model })
  })
  if (!response.ok) throw new Error('Failed to switch AI model')
  return response.json()
}

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [aiModels, setAiModels] = useState([])
  const [currentModel, setCurrentModel] = useState('')

  const fetchChatHistory = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setMessages([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetchChatHistoryAPI(token)
      setMessages(response.data || [])
    } catch (error) {
      console.error('Error fetching chat history:', error)
      setMessages([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return

    const token = localStorage.getItem('token')
    if (!token) {
      toast.error('Please login to send messages')
      return
    }

    setIsSending(true)
    
    try {
      // Add user message immediately
      const userMessage = {
        _id: `user-${Date.now()}`,
        content: text,
        sender: { _id: 'current-user', name: 'You', email: '' },
        recipient: { _id: 'ai-user', name: 'Zara AI', email: '' },
        createdAt: new Date(),
        messageType: 'text'
      }
      
      setMessages(prev => [...prev, userMessage])
      
      // Send to backend
      const response = await sendMessageAPI(text, token)
      
      if (response.success && response.data) {
        setMessages(prev => [...prev, response.data])
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send message')
      setMessages(prev => prev.filter(msg => msg._id !== `user-${Date.now()}`))
    } finally {
      setIsSending(false)
    }
  }, [])

  const clearChat = useCallback(async () => {
    const token = localStorage.getItem('token')
    try {
      if (token) await clearChatAPI(token)
      setMessages([])
      toast.success('Chat cleared successfully')
    } catch (error) {
      console.error('Error clearing chat:', error)
      setMessages([])
    }
  }, [])

  const fetchAIModels = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await getAIModelsAPI(token)
      if (response.success) {
        setAiModels(response.data.models)
        setCurrentModel(response.data.currentModel)
      }
    } catch (error) {
      console.error('Error fetching AI models:', error)
    }
  }, [])

  const switchAIModel = useCallback(async (model) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await switchAIModelAPI(model, token)
      if (response.success) {
        setCurrentModel(model)
        toast.success(`Switched to ${model}`)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to switch model')
    }
  }, [])

  return {
    messages,
    isLoading,
    isSending,
    aiModels,
    currentModel,
    fetchChatHistory,
    sendMessage,
    clearChat,
    fetchAIModels,
    switchAIModel
  }
}