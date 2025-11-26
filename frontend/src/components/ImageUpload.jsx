// components/ImageUpload.jsx
import { useRef, useState } from 'react'

const ImageUpload = ({ onImageAnalyze, isAnalyzing }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [prompt, setPrompt] = useState("What's in this image?")
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleFileSelect = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }
      setSelectedImage(file)
    }
  }

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    handleFileSelect(file)
  }

  const handleAnalyze = () => {
    if (selectedImage && onImageAnalyze) {
      onImageAnalyze(selectedImage, prompt)
    }
  }

  const clearSelection = () => {
    setSelectedImage(null)
    setPrompt("What's in this image?")
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="p-6 border-2 border-dashed border-gray-600 rounded-2xl bg-gray-800 hover:border-purple-500 transition-all">
      <h3 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        <span className="text-2xl">📸</span>
        Analyze Image
      </h3>
      
      <div className="space-y-4">
        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-purple-500 bg-purple-500 bg-opacity-10' 
              : 'border-gray-600 hover:border-purple-400'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-4xl mb-3">🖼️</div>
          <p className="text-gray-300 mb-2">Drop your image here or click to browse</p>
          <p className="text-sm text-gray-500">Supports JPG, PNG, GIF, WebP (Max 5MB)</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
        
        {/* Selected File Info */}
        {selectedImage && (
          <div className="bg-gray-700 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg">📷</span>
                </div>
                <div>
                  <p className="text-white font-medium">{selectedImage.name}</p>
                  <p className="text-sm text-gray-400">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Prompt Input */}
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="What would you like to know about this image?"
          className="w-full p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all"
        />
        
        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={!selectedImage || isAnalyzing}
          className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none font-semibold flex items-center justify-center gap-2"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Analyzing...
            </>
          ) : (
            <>
              <span>🔍</span>
              Analyze Image
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default ImageUpload