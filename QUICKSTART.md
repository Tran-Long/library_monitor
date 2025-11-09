# 🏛️ Library Monitor - Quick Reference

A comprehensive web application for managing library operations with multiple libraries, bookshelves, shelves, books, customers, and borrowing records.

## 🎯 What's Included

### ✅ Complete Backend (Django + Ninja)
- Full REST API with 50+ endpoints
- 6 core database models with relationships
- PostgreSQL database with migrations
- Admin interface pre-configured
- CORS and security configured

### ✅ Modern Frontend (React + TypeScript)
- Type-safe React components
- Tailwind CSS styling
- React Icons integration
- Axios API client
- Responsive design

### ✅ Production-Ready Infrastructure
- Docker & Docker Compose setup
- Works on Windows, Ubuntu, macOS
- PostgreSQL containerized
- Auto-migrations on startup
- Environment configuration

### ✅ Comprehensive Documentation
- SETUP.md - Installation guide
- DEVELOPMENT.md - Developer guide
- PROJECT_SUMMARY.md - Complete overview

## 🚀 Get Started in 30 Seconds

### Option 1: Using Docker (Recommended)
```bash
# Windows
start.bat

# Linux/Mac
chmod +x start.sh
./start.sh
```

### Option 2: Manual Docker
```bash
docker-compose up -d
```

### Option 3: Local Development
```bash
# Backend
cd backend && python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (in new terminal)
cd frontend && npm install && npm run dev
```

## 🌐 Access Your Application

After starting:
- **Frontend**: http://localhost:3000 - Web UI
- **API**: http://localhost:8000/api - REST API endpoints
- **Admin**: http://localhost:8000/admin - Database management

## 📊 Database Schema

```
Library (main entity)
├── Bookshelves (organize by room/section)
│   └── Shelves (display as rows)
│       └── Books (inventory)
└── Customers (registered users)
    └── Borrowings (checkout records)
```

## 🔌 API Overview

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/libraries/` | GET, POST | Manage libraries |
| `/bookshelves/` | GET, POST | Organize bookshelves |
| `/shelves/` | GET, POST | Manage shelves |
| `/books/` | GET, POST | Track books |
| `/customers/` | GET, POST | Manage customers |
| `/borrowings/` | GET, POST | Handle borrowing |

All endpoints support full CRUD operations.

## 📁 Project Structure

```
library_monitor/
├── backend/                    # Django backend
│   ├── apps/
│   │   ├── libraries/         # Library management
│   │   ├── bookshelves/       # Bookshelf management
│   │   ├── shelves/           # Shelf management
│   │   ├── books/             # Book inventory
│   │   ├── customers/         # Customer records
│   │   └── borrowings/        # Borrowing workflows
│   ├── api/
│   │   ├── router.py          # All API routes
│   │   └── schemas.py         # Request/response types
│   ├── library_monitor/       # Django config
│   └── manage.py
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API client
│   │   ├── types/             # TypeScript types
│   │   ├── styles/            # CSS files
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   └── package.json
├── docker-compose.yml         # Full stack setup
├── start.sh                   # Linux/Mac startup script
├── start.bat                  # Windows startup script
└── [documentation files]
```

## 🛠️ Key Features

### Libraries
- Create and manage multiple libraries
- Drag-and-drop reordering
- Store address, phone, email

### Bookshelves
- Organize bookshelves per library
- Location tracking
- Drag-and-drop reordering

### Shelves
- Display as rows within bookshelves
- Set book capacity
- Ordered display

### Books
- Full inventory management
- Track ISBN, title, author
- Monitor condition and availability
- Know which shelf contains each book

### Customers
- Register and manage users
- View borrowing history
- Track active/inactive status

### Borrowing System
- Track book loans
- Set due dates
- Record returns
- Identify overdue books

## 📚 Documentation

| File | Purpose |
|------|---------|
| README.md | Features overview |
| SETUP.md | Installation & deployment guide |
| DEVELOPMENT.md | Developer guide |
| PROJECT_SUMMARY.md | Complete technical overview |

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Access database shell
docker-compose exec db psql -U postgres -d library_monitor

# Run Django management command
docker-compose exec backend python manage.py shell
```

## 🔧 Local Development Commands

### Backend
```bash
cd backend
python manage.py migrate        # Run migrations
python manage.py createsuperuser # Create admin user
python manage.py shell         # Interactive shell
python manage.py runserver     # Start dev server
```

### Frontend
```bash
cd frontend
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run type-check            # Check TypeScript
```

## 📊 Technology Stack

### Backend
- **Python 3.11** - Programming language
- **Django 4.2** - Web framework
- **Django Ninja 1.3** - REST API
- **PostgreSQL 15** - Database
- **Gunicorn** - WSGI server

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Tailwind CSS 3** - Styling
- **Vite 5** - Build tool
- **Axios** - HTTP client
- **React Icons** - Icon library

## 🔐 Security Features

- ✅ CORS configuration
- ✅ SQL injection prevention (ORM)
- ✅ CSRF protection
- ✅ Input validation
- ✅ Environment secrets management

## 🎨 UI/UX Features

- 📱 Responsive design
- 🎨 Tailwind CSS styling
- 🏷️ Graphical icons
- 📊 Card-based layouts
- ✨ Loading states
- ⚠️ Error handling
- 🔄 Drag-and-drop ready

## 🚀 Next Steps

1. **Start the application** using start.sh or start.bat
2. **Explore the API** at http://localhost:8000/api
3. **Try the UI** at http://localhost:3000
4. **Create test data** via admin panel
5. **Read DEVELOPMENT.md** to extend features

## 🐛 Troubleshooting

### Port already in use
Change port in docker-compose.yml:
```yaml
ports:
  - "8001:8000"  # Use 8001 instead
```

### Database connection error
Ensure PostgreSQL container is running:
```bash
docker-compose logs db
```

### Frontend can't reach API
Check backend is running:
```bash
docker-compose logs backend
```

## 📝 Environment Variables

Create `backend/.env`:
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/library_monitor
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a PR

## 📞 Getting Help

1. Check **SETUP.md** for installation issues
2. Check **DEVELOPMENT.md** for code questions
3. Review code comments
4. Check official docs for frameworks

## 📄 License

MIT License - See LICENSE file for details

## 🎉 What You Have Now

✅ Complete backend API
✅ Modern React frontend
✅ Database with 6 models
✅ Docker deployment ready
✅ Type-safe code
✅ Responsive UI
✅ Full documentation
✅ Cross-platform support

**Ready to use! Start building your library management system now!**

---

Last Updated: November 2025 | Status: ✅ Production Ready
