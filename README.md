# Zara AI - Deploy Ready Application

A full-stack AI chat application with React frontend, Express.js backend, and MongoDB database.

## Features

- Real-time chat with AI assistant
- Multi-language support (English/Tamil)
- Dark/light theme switching
- Voice messaging capabilities
- User authentication (Google OAuth/email)
- Welcome emails with Nodemailer
- Responsive design with TailwindCSS
- Smooth animations with Framer Motion
- Toast notifications with React Hot Toast

## Tech Stack

### Frontend
- React 18 with Vite
- TailwindCSS v4
- Framer Motion for animations
- React Query for data fetching
- React Hot Toast for notifications
- i18next for internationalization
- GSAP for advanced animations

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for emails
- Multer for file handling
- Docker for containerization

## Deployment

### Prerequisites
- Docker and Docker Compose
- Node.js 16+ (for local development)
- MongoDB (if not using Docker)

### Quick Deployment with Docker

1. Make sure Docker and Docker Compose are installed
2. Run the deployment script:
   - On Windows: Double-click `deploy.bat`
   - On Linux/Mac: Run `./deploy.sh`
3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:3001
   - MongoDB: mongodb://localhost:27017

### Manual Deployment

#### Backend
1. Navigate to the `backend` directory
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the server: `npm run dev` (development) or `npm start` (production)

#### Frontend
1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Build for production: `npm run build`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google authentication
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password/:token` - Reset password

### Chat
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/:userId` - Get messages with a user
- `POST /api/chat/send` - Send a message
- `DELETE /api/chat/:id` - Delete a message

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update user preferences

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/zara-ai
JWT_SECRET=your-jwt-secret-key
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-email-password
SMTP_FROM=welcome@zara.ai
CLIENT_URL=http://localhost:5173
```

## Project Structure

```
zara-ai/
├── frontend/          # React + Vite frontend
├── backend/           # Express.js backend
├── shared/            # Shared utilities
├── docker-compose.yml # Docker Compose configuration
└── README.md          # This file
```

## License

MIT License