# Nexus Contact Centre - Full Stack Application

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

A modern, full-stack contact centre application with real-time messaging, WebRTC calling capabilities, and a comprehensive admin dashboard.

## 🚀 Features

### Backend
- **REST API** built with Express.js and TypeScript
- **WebSocket Server** for real-time messaging
- **SQLite Database** with better-sqlite3 for data persistence
- **JWT Authentication** for secure user sessions
- **File Upload** support for images, videos, audio, and documents
- **Role-based Access Control** (Admin/User roles)

### Frontend
- **React 19** with TypeScript
- **Real-time Messaging** via WebSocket
- **Admin Dashboard** for user management
- **User Portal** for messaging with admins
- **File Sharing** with preview support
- **Modern UI** with Tailwind CSS

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mirzamyounas3399-ai/Mirza-Contact-Centre.git
   cd Mirza-Contact-Centre
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Update `.env.local` with your configurations:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

## 🚀 Running the Application

### Development Mode (Recommended)

Run both frontend and backend concurrently:

```bash
npm run dev:all
```

This will start:
- Frontend (Vite): http://localhost:3000
- Backend (Express): http://localhost:3001
- WebSocket Server: ws://localhost:3001/ws

### Run Frontend Only

```bash
npm run dev
```

### Run Backend Only

```bash
npm run dev:server
```

### Production Mode

1. **Build the application**
   ```bash
   npm run build
   npm run build:server
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
mirza-contact-centre/
├── server/                 # Backend source code
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Auth & validation middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # WebSocket service
│   ├── types/             # TypeScript types
│   └── index.ts           # Server entry point
├── src/                   # Frontend source code
│   ├── components/        # React components
│   ├── services/          # API & WebSocket clients
│   ├── App.tsx            # Main app component
│   └── index.tsx          # Entry point
├── public/                # Static files
│   └── uploads/           # Uploaded files storage
├── data/                  # SQLite database
└── package.json           # Dependencies & scripts
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Users
- `GET /api/users` - Get all users (authenticated)
- `GET /api/users/role/:role` - Get users by role
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages` - Get user messages
- `GET /api/messages/conversation/:userId` - Get conversation
- `PUT /api/messages/:messageId/read` - Mark message as read
- `PUT /api/messages/conversation/:userId/read` - Mark conversation as read
- `GET /api/messages/unread/count` - Get unread count

### File Upload
- `POST /api/upload` - Upload file

### Health Check
- `GET /api/health` - Server health status

## 🔌 WebSocket Events

### Client → Server
- `message` - Send chat message
- `call-signal` - WebRTC signaling
- `typing` - Typing indicator

### Server → Client
- `connected` - Connection established
- `message` - New message received
- `message-sent` - Message sent confirmation
- `call-signal` - Call signal from peer
- `typing` - User typing status

## 👥 User Roles

### Admin
- View all users and statistics
- Delete users
- Receive messages from all users
- Full system access

### User
- Message admins
- Upload and share files
- View conversation history
- Manage own profile

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- File type validation
- File size limits (50MB)
- SQL injection prevention
- XSS protection

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- WebSocket (ws)
- better-sqlite3
- bcryptjs
- jsonwebtoken
- multer

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Vite
- WebSocket API

## 📝 Environment Variables

### Backend (.env.local)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws
```

## 🚀 Deployment

### Production Checklist
- [ ] Change JWT_SECRET to a strong random value
- [ ] Set NODE_ENV=production
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure file upload limits
- [ ] Set up database backups
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up monitoring and logging

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Mirza Muhammad Younas**
- GitHub: [@mirzamyounas3399-ai](https://github.com/mirzamyounas3399-ai)

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by enterprise contact centre solutions
- Community feedback and contributions

---

**Note**: This is a development version. For production deployment, please ensure all security measures are properly configured.
