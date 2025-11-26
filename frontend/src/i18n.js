import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      // Existing translations
      chat_with_zara: "Chat with Zara",
      online: "Online",
      type_a_message: "Type a message...",
      attach_file: "Attach File",
      emoji: "Emoji",
      zara_features: "Zara AI Features",
      lightning_auth: "Lightning Auth",
      secure_authentication: "Secure authentication with Google/OAuth and email",
      welcome_emails: "Welcome Emails",
      personalized_templates: "Personalized email templates with Nodemailer",
      multi_language: "Multi-language",
      tunglish_support: "Full Tunglish support",
      smooth_animations: "Smooth Animations",
      micro_interactions: "Page transitions and micro-interactions",
      voice_messages: "Voice Messages",
      audio_recording: "Audio recording and playback",
      themes: "Themes",
      dark_light_mode: "Dark/light mode switching",
      all_rights_reserved: "All rights reserved",
      
      // New translations for landing page
      welcome_to_zara_ai: "Welcome to Zara AI",
      ai_powered_chat_experience: "AI-powered chat experience with real-time messaging",
      get_started: "Get Started",
      key_features: "Key Features",
      real_time_chat: "Real-time Chat",
      chat_with_ai_assistant: "Chat with our intelligent AI assistant",
      support_for_english_tamil: "Support for English and Tamil languages",
      theme_support: "Theme Support",
      light_and_dark_modes: "Light and dark mode options",
      send_voice_recordings: "Send voice recordings with ease",
      secure_auth: "Secure Authentication",
      google_and_email_login: "Login with Google or email",
      personalized_email_templates: "Personalized email templates",
      login: "Login",
      sign_in: "Sign In"
    }
  },
  ta: {
    translation: {
      // Existing translations
      chat_with_zara: "ஜாராவுடன் உரையாடுங்கள்",
      online: "ஆன்லைனில்",
      type_a_message: "செய்தியை தட்டச்சு செய்யவும்...",
      attach_file: "கோப்பை இணைக்கவும்",
      emoji: "உணர்வுரு",
      zara_features: "ஜாரா ஏஐ அம்சங்கள்",
      lightning_auth: "லைட்னிங் அங்கீகாரம்",
      secure_authentication: "Google/OAuth மற்றும் மின்னஞ்சலுடன் பாதுகாப்பான அங்கீகாரம்",
      welcome_emails: "வரவேற்பு மின்னஞ்சல்கள்",
      personalized_templates: "Nodemailer உடன் தனிப்பயன் மின்னஞ்சல் டெம்ப்ளேட்டுகள்",
      multi_language: "பல மொழிகள்",
      tunglish_support: "முழு தமிழ்-ஆங்கிலம் ஆதரவு",
      smooth_animations: "ஸ்மூத் அனிமேஷன்கள்",
      micro_interactions: "பக்க மாற்றங்கள் மற்றும் சிறிய ஊடாடல்கள்",
      voice_messages: "குரல் செய்திகள்",
      audio_recording: "ஆடியோ பதிவு மற்றும் இயக்கம்",
      themes: "தீம்கள்",
      dark_light_mode: "இருண்ட/ஒளி முறை மாற்றம்",
      all_rights_reserved: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை",
      
      // New translations for landing page
      welcome_to_zara_ai: "ஜாரா ஏஐக்கு வரவேற்கிறோம்",
      ai_powered_chat_experience: "செயல்மிக்க செயற்கை நுணர்வுடன் உரையாடுங்கள்",
      get_started: "தொடங்குங்கள்",
      key_features: "முக்கிய அம்சங்கள்",
      real_time_chat: "நேரடி உரையாடல்",
      chat_with_ai_assistant: "எங்கள் செயற்கை நுணர்வு உதவியாளருடன் உரையாடுங்கள்",
      multi_language: "பல மொழிகள்",
      support_for_english_tamil: "ஆங்கிலம் மற்றும் தமிழுக்கான ஆதரவு",
      theme_support: "தீம் ஆதரவு",
      light_and_dark_modes: "ஒளி மற்றும் இருள் முறைகள்",
      voice_messages: "குரல் செய்திகள்",
      send_voice_recordings: "எளிதாக குரல் பதிவுகளை அனுப்பவும்",
      secure_auth: "பாதுகாப்பான அங்கீகாரம்",
      google_and_email_login: "Google அல்லது மின்னஞ்சல் மூலம் உள்நுழையவும்",
      personalized_email_templates: "தனிப்பயன் மின்னஞ்சல் டெம்ப்ளேட்டுகள்",
      login: "உள்நுழைக",
      sign_in: "உள்நுழைக"
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  })

export default i18n