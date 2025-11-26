import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'

const Landing = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/app')
    }
  }, [navigate])

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'ta' : 'en')
  }

  const handleGetStarted = () => {
    const token = localStorage.getItem('token')
    if (token) {
      // If logged in, go directly to app
      navigate('/app')
    } else {
      // If not logged in, go to login
      navigate('/login')
    }
  }

  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <div className="min-h-screen futuristic-gradient text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-gray-900"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6">
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center neon-glow">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Zara AI
          </span>
        </motion.div>
        
        <motion.div 
          className="flex space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <button 
            onClick={toggleLanguage}
            className="btn-secondary"
          >
            {i18n.language === 'en' ? 'தமிழ்' : 'English'}
          </button>
          <button 
            onClick={handleLogin}
            className="btn-primary"
          >
            {t('login')}
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {t('welcome_to_zara_ai')}
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t('ai_powered_chat_experience')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <button 
              onClick={handleGetStarted}
              className="btn-primary text-lg px-8 py-4"
            >
              {t('get_started')}
            </button>
            <button 
              onClick={handleLogin}
              className="btn-secondary text-lg px-8 py-4"
            >
              {t('sign_in')}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.h2 
          className="text-4xl md:text-5xl font-bold text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            {t('key_features')}
          </span>
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            { 
              icon: '🤖', 
              title: t('real_time_chat'), 
              description: t('chat_with_ai_assistant') 
            },
            { 
              icon: '🌍', 
              title: t('multi_language'), 
              description: t('support_for_english_tamil') 
            },
            { 
              icon: '⚡', 
              title: 'Lightning Fast', 
              description: 'Instant responses with minimal latency' 
            },
            { 
              icon: '🔒', 
              title: t('secure_auth'), 
              description: t('google_and_email_login') 
            },
            { 
              icon: '🎯', 
              title: 'Smart Context', 
              description: 'Remembers conversation context and history' 
            },
            { 
              icon: '🚀', 
              title: 'Always Evolving', 
              description: 'Continuously updated with latest AI models' 
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="glass-effect rounded-3xl p-8 hover:neon-glow transition-all duration-500 group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-effect rounded-3xl p-12 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience the Future of AI?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already transforming their communication with Zara AI.
          </p>
          <button 
            onClick={handleGetStarted}
            className="btn-primary text-lg px-10 py-4"
          >
            Start Chatting Now
          </button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-12 text-center glass-effect border-t border-white border-opacity-10">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Zara AI
            </span>
          </div>
          <p className="text-gray-400">
            © {new Date().getFullYear()} Zara AI. {t('all_rights_reserved')}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing;