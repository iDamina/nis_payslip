# NIS Payslip Application

A full-stack web application for managing and generating employee payslips with PDF export functionality.

## 🚀 Features

- **User Authentication** - Secure login system with JWT tokens
- **Payslip Management** - Create, view, and edit employee payslips
- **PDF Export** - Generate and download payslips as PDF documents
- **Responsive Design** - Mobile-friendly interface built with Tailwind CSS
- **Modern UI** - Clean and intuitive user interface with React components

## 🛠 Technology Stack

### Frontend
- **React 19** - Modern React with hooks and functional components
- **Vite 7** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Router 7** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Modern icon library
- **React Toastify** - Toast notifications
- **jsPDF & html2canvas** - PDF generation and export

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **JWT** - JSON Web Token authentication

## 📁 Project Structure

```
nis_payslip/
├── backend/
│   ├── package.json
│   └── [backend source files]
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── postcss.config.cjs
│   └── tailwind.config.js
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/iDamina/nis_payslip.git
cd nis_payslip
```

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000` (or your configured port)

## 🚀 Deployment

This application is configured for deployment on [Render](https://render.com).

### Build Configuration
- **Build Command**: `cd backend && npm install && cd ../frontend && npm install && npm run build`
- **Start Command**: `cd backend && npm start`

### Environment Variables
Make sure to set up the necessary environment variables in your deployment platform:
- Database connection strings
- JWT secrets
- API endpoints

## 📋 Available Scripts

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

### Backend
```bash
npm start        # Start the server
npm run dev      # Start with nodemon (if configured)
```

## 🎨 UI Components

The application uses a modern component-based architecture with:
- Reusable React components
- Tailwind CSS for styling
- Responsive design patterns
- Accessible UI elements

## 📱 Features Overview

### Authentication
- Secure user login and registration
- JWT-based session management
- Protected routes and middleware

### Payslip Management
- Create new payslips with employee details
- Edit existing payslip information
- View payslip history and records

### PDF Export
- Generate professional PDF payslips
- Download functionality
- Print-ready formatting

## 🔒 Security

- JWT token authentication
- Secure API endpoints
- Input validation and sanitization
- Protected routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**iDamina** - [GitHub Profile](https://github.com/iDamina)

## 🐛 Issues

If you encounter any issues or have suggestions, please [open an issue](https://github.com/iDamina/nis_payslip/issues) on GitHub.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.

---

⭐ If you found this project helpful, please give it a star on GitHub!
