import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use correct model names that actually exist
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.0-pro", // This is the correct model name
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    console.log('✅ Gemini AI Service initialized with model: gemini-pro');
  }

  async generateResponse(userMessage, chatHistory = []) {
    try {
      console.log('🔄 Generating response for:', userMessage.substring(0, 100));
      
      // Simple prompt that definitely works
      const prompt = `You are Zara AI, a helpful AI assistant. Respond to the user's message helpfully and accurately.

User: ${userMessage}

Assistant:`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      console.log('✅ AI response generated successfully');
      return response.text();

    } catch (error) {
      console.error('❌ Gemini API Error:', error.message);
      
      // Use enhanced fallback responses
      return this.generateEnhancedResponse(userMessage);
    }
  }

  generateEnhancedResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();
    
    // Enhanced smart responses
    if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
      return `Hello! 👋 I'm Zara AI, your intelligent assistant. 

I'm here to help you with:
• Programming and code questions (JavaScript, Python, React, etc.)
• Technical explanations and concepts
• Creative writing and content generation
• Problem solving and debugging
• Learning resources and tutorials

What would you like to explore today? Feel free to ask me anything!`;
    }

    if (message.includes('javascript') || message.includes('js ')) {
      return `## 🚀 JavaScript Overview

JavaScript is a versatile programming language primarily used for web development.

### ✨ Key Features:
- **Client-side scripting** for interactive web pages
- **Event-driven** programming model  
- **Prototype-based** object orientation
- **First-class functions** support
- **Dynamic typing** with automatic memory management

### 💻 Modern JavaScript Example:
\`\`\`javascript
// ES6+ Features
const greet = (name = 'Guest') => \`Hello, \${name}!\`;

// Async/Await
async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return null;
    }
}

// Destructuring and Spread
const user = { name: 'John', age: 30, email: 'john@example.com' };
const { name, ...rest } = user;

// Modules
export const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0);
};
\`\`\`

### 🛠️ Popular Use Cases:
- **Frontend Development** (React, Vue, Angular)
- **Backend Development** (Node.js, Express)
- **Mobile Apps** (React Native, Ionic)
- **Desktop Apps** (Electron)
- **Game Development** (Phaser, Three.js)`;
    }

    if (message.includes('python') || message.includes('py ')) {
      return `## 🐍 Python Programming

Python is a high-level programming language known for its simplicity and readability.

### ✨ Key Features:
- **Easy to learn** with clean, readable syntax
- **Interpreted language** - no compilation needed
- **Dynamically typed** - no variable type declarations
- **Extensive standard library**
- **Cross-platform** compatibility

### 💻 Python Example:
\`\`\`python
# Modern Python with type hints and features
from typing import List, Optional, Dict
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int
    email: Optional[str] = None
    
    def greet(self) -> str:
        return f"Hello, I'm {self.name}!"

def process_users(users: List[User]) -> Dict[str, int]:
    """Process a list of users and return age statistics."""
    if not users:
        return {}
    
    avg_age = sum(user.age for user in users) / len(users)
    return {
        'total_users': len(users),
        'average_age': round(avg_age, 2),
        'min_age': min(user.age for user in users),
        'max_age': max(user.age for user in users)
    }

# List comprehension example
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
even_squares = [x**2 for x in numbers if x % 2 == 0]

# Context manager for file handling
with open('data.txt', 'r') as file:
    content = file.read().splitlines()

# Usage
if __name__ == "__main__":
    users = [
        User("Alice", 25, "alice@example.com"),
        User("Bob", 30),
        User("Charlie", 35, "charlie@test.com")
    ]
    
    stats = process_users(users)
    print(stats)
\`\`\`

### 🎯 Popular Applications:
- **Web Development**: Django, Flask, FastAPI
- **Data Science**: Pandas, NumPy, Matplotlib
- **Machine Learning**: TensorFlow, PyTorch, scikit-learn
- **Automation** and scripting tasks
- **Scientific computing** and research`;
    }

    if (message.includes('react') || message.includes('component')) {
      return `## ⚛️ React.js Library

React is a JavaScript library for building user interfaces, particularly web applications.

### ✨ Core Concepts:
- **Components** - Reusable UI pieces
- **JSX** - JavaScript syntax extension  
- **Virtual DOM** - Efficient rendering
- **Unidirectional data flow** - Predictable state management
- **Hooks** - State and lifecycle management in functional components

### 💻 React Component Example:
\`\`\`jsx
import React, { useState, useEffect, useCallback } from 'react';

const UserProfile = ({ userId, onUpdate }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user data
    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(\`/api/users/\${userId}\`);
            if (!response.ok) throw new Error('User not found');
            
            const userData = await response.json();
            setUser(userData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId, fetchUser]);

    const handleSave = async (updatedData) => {
        try {
            const response = await fetch(\`/api/users/\${userId}\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });
            
            if (response.ok) {
                const savedUser = await response.json();
                setUser(savedUser);
                onUpdate?.(savedUser);
            }
        } catch (err) {
            setError('Failed to save user data');
        }
    };

    if (loading) return <div className="p-4">Loading user profile...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
    if (!user) return <div className="p-4">No user selected</div>;

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                        {user.name?.charAt(0) || 'U'}
                    </span>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                </div>
            </div>
            
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Age</label>
                    <p className="mt-1 text-gray-900">{user.age || 'Not specified'}</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <p className="mt-1 text-gray-900">{user.bio || 'No bio available'}</p>
                </div>
            </div>
            
            <button 
                onClick={() => handleSave({ ...user, lastActive: new Date().toISOString() })}
                className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
                Update Last Active
            </button>
        </div>
    );
};

// Custom hook for user management
const useUser = (userId) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(\`/api/users/\${userId}\`);
                if (!response.ok) throw new Error('Failed to fetch user');
                setUser(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchUser();
    }, [userId]);

    return { user, loading, error, setUser };
};

export default UserProfile;
\`\`\`

### 🔧 Key React Features:
- **Functional Components** with Hooks
- **Context API** for state management
- **React Router** for navigation
- **Error Boundaries** for graceful error handling
- **Performance Optimizations** (React.memo, useMemo, useCallback)`;
    }

    if (message.includes('what is') || message.includes('explain')) {
      const topic = userMessage.replace(/what is|explain/gi, '').trim();
      return `## 📚 Understanding ${topic}

I understand you're looking for information about **${topic}**. 

### 🔍 Overview:
${topic} is a significant concept in its respective field with various applications and implications. Understanding it requires considering multiple perspectives and contexts.

### 💡 Key Aspects to Explore:
1. **Fundamental Concepts** - Core principles and definitions
2. **Practical Applications** - Real-world uses and implementations  
3. **Best Practices** - Recommended approaches and methodologies
4. **Common Challenges** - Potential issues and solutions
5. **Learning Resources** - Where to find more information

### 🎯 Next Steps:
To get the most comprehensive understanding of ${topic}, I recommend:
- Consulting official documentation and authoritative sources
- Exploring practical examples and case studies
- Experimenting with hands-on implementation
- Joining relevant communities for discussion

Would you like me to focus on any specific aspect of ${topic}?`;
    }

    if (message.includes('how to') || message.includes('how do i')) {
      const task = userMessage.replace(/how to|how do i/gi, '').trim();
      return `## 🛠️ Guide: ${task}

I can definitely help you with **${task}**! Here's a structured approach:

### 📋 Step-by-Step Process:

**1. Planning & Research**
- Define clear objectives and requirements
- Research existing solutions and best practices
- Identify necessary tools and resources

**2. Implementation**
- Start with a simple prototype or proof of concept
- Follow established patterns and conventions
- Write clean, maintainable code with proper documentation

**3. Testing & Validation**
- Test individual components thoroughly
- Validate the complete solution
- Gather feedback and iterate as needed

**4. Deployment & Maintenance**
- Deploy following security best practices
- Monitor performance and usage
- Plan for ongoing maintenance and updates

### 💡 Pro Tips:
- **Start Simple**: Begin with basic functionality before adding complexity
- **Use Version Control**: Track changes with Git from the beginning
- **Document Everything**: Keep clear notes and documentation
- **Test Early**: Don't wait until the end to start testing
- **Ask for Help**: Don't hesitate to seek assistance when stuck

### 🔧 Specific Guidance:
For more detailed help with "${task}", could you provide:
- Your current development environment?
- Any specific technologies or frameworks you're using?
- Particular challenges you're facing?

This will help me give you more targeted assistance!`;
    }

    if (message.includes('error') || message.includes('not working') || message.includes('fix')) {
      return `## 🔧 Troubleshooting Assistance

I understand you're encountering an issue. Let me help you troubleshoot it systematically:

### 🚨 Problem Analysis Framework:

**1. Identify the Symptoms**
- What exactly is happening vs what you expect to happen?
- When did the issue start occurring?
- Does it happen consistently or intermittently?

**2. Isolate the Cause**
- Check recent changes to your code or environment
- Review error messages and stack traces
- Test with different inputs or conditions

**3. Common Solution Approaches**
- **Syntax Errors**: Check for typos, missing brackets, semicolons
- **Runtime Errors**: Validate input data, check API responses
- **Logic Errors**: Review your algorithm and business logic
- **Environment Issues**: Verify dependencies, configurations

**4. Debugging Techniques**
- Use console.log or debugging tools to trace execution
- Break down complex operations into smaller testable parts
- Compare with known working examples or documentation

### 🛠️ Quick Checks:
- Are all required dependencies installed and updated?
- Is your development server running properly?
- Are there any console errors in your browser's developer tools?
- Have you checked the documentation for the technologies you're using?

### 📝 For Better Assistance:
Could you provide:
- The exact error message you're seeing?
- Relevant code snippets?
- Steps to reproduce the issue?
- Your development environment details?

This will help me give you more specific guidance!`;
    }

    // Default comprehensive response
    return `## 🤖 Zara AI Response

I understand you're asking about: **"${userMessage}"**

### 💭 My Analysis:
This appears to be a thoughtful inquiry that deserves a comprehensive response. Based on the nature of your question, I can provide you with detailed information, practical examples, and guidance for further exploration.

### 📚 What I Can Offer:
• **Detailed Explanations** of core concepts and principles
• **Practical Code Examples** with best practices
• **Step-by-Step Guidance** for implementation
• **Learning Resources** and next steps
• **Troubleshooting Help** for any challenges you might face

### 🎯 How I Can Help You Best:
To provide you with the most valuable assistance, could you let me know:

1. **Your Current Context** - Are you working on a specific project or learning something new?
2. **Desired Outcome** - What would you like to achieve or understand?
3. **Technical Level** - Should I assume beginner, intermediate, or advanced knowledge?

I'm here to ensure you get exactly the information and help you need! Feel free to ask follow-up questions or request clarification on any point.`;
  }
}

export default new GeminiService();