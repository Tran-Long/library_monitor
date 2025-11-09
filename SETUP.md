# Setup Guide for Library Monitor

## Prerequisites

### For Docker (Recommended for Windows and Ubuntu)
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+

### For Local Development
- Python 3.10+
- Node.js 18+
- PostgreSQL 13+
- Git

## Quick Start with Docker

### 1. Clone or setup the project
```bash
cd /path/to/library_monitor
```

### 2. Configure environment
Copy the backend environment template:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` if needed for your local setup.

### 3. Start services
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Run Django backend migrations
- Start Django development server at http://localhost:8000
- Start React frontend at http://localhost:3000

### 4. Access the application
- Frontend: http://localhost:3000
- API: http://localhost:8000/api
- Django Admin: http://localhost:8000/admin

## Local Development Setup

### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure database**
Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

Update with your database credentials.

4. **Run migrations**
```bash
python manage.py migrate
```

5. **Create superuser (optional)**
```bash
python manage.py createsuperuser
```

6. **Start development server**
```bash
python manage.py runserver
```

Server runs at: http://localhost:8000

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Start development server**
```bash
npm run dev
```

Frontend runs at: http://localhost:3000

## API Documentation

All endpoints are available at `http://localhost:8000/api/`

### Libraries
- `GET /api/libraries/` - List all libraries
- `POST /api/libraries/` - Create a new library
- `GET /api/libraries/{id}/` - Get a library
- `PUT /api/libraries/{id}/` - Update a library
- `DELETE /api/libraries/{id}/` - Delete a library
- `POST /api/libraries/reorder/` - Reorder libraries

### Bookshelves
- `GET /api/bookshelves/` - List bookshelves (optional filter by library_id)
- `POST /api/bookshelves/` - Create a bookshelf
- `GET /api/bookshelves/{id}/` - Get a bookshelf
- `PUT /api/bookshelves/{id}/` - Update a bookshelf
- `DELETE /api/bookshelves/{id}/` - Delete a bookshelf
- `POST /api/bookshelves/reorder/` - Reorder bookshelves

### Shelves
- `GET /api/shelves/` - List shelves (optional filter by bookshelf_id)
- `POST /api/shelves/` - Create a shelf
- `GET /api/shelves/{id}/` - Get a shelf
- `PUT /api/shelves/{id}/` - Update a shelf
- `DELETE /api/shelves/{id}/` - Delete a shelf
- `POST /api/shelves/reorder/` - Reorder shelves

### Books
- `GET /api/books/` - List books (optional filters: shelf_id, is_available)
- `POST /api/books/` - Create a book
- `GET /api/books/{id}/` - Get a book
- `PUT /api/books/{id}/` - Update a book
- `DELETE /api/books/{id}/` - Delete a book

### Customers
- `GET /api/customers/` - List customers (optional filter: is_active)
- `POST /api/customers/` - Create a customer
- `GET /api/customers/{id}/` - Get a customer
- `PUT /api/customers/{id}/` - Update a customer
- `DELETE /api/customers/{id}/` - Delete a customer

### Borrowings
- `GET /api/borrowings/` - List borrowing records
- `POST /api/borrowings/` - Create a borrowing record
- `GET /api/borrowings/{id}/` - Get a borrowing record
- `PUT /api/borrowings/{id}/` - Update a borrowing record
- `DELETE /api/borrowings/{id}/` - Delete a borrowing record
- `POST /api/borrowings/{id}/return/` - Mark book as returned

## Project Structure

```
library_monitor/
├── backend/
│   ├── apps/
│   │   ├── libraries/       # Library management app
│   │   ├── bookshelves/     # Bookshelf management app
│   │   ├── shelves/         # Shelf management app
│   │   ├── books/           # Book management app
│   │   ├── customers/       # Customer management app
│   │   └── borrowings/      # Borrowing records app
│   ├── api/
│   │   ├── router.py        # API routes
│   │   └── schemas.py       # Request/response schemas
│   ├── library_monitor/
│   │   ├── settings.py      # Django settings
│   │   └── urls.py          # URL configuration
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # CSS files
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
├── docker-compose.yml
├── .gitignore
└── README.md
```

## Deployment

### Using Docker

For production deployment:

1. **Update environment variables in docker-compose.yml:**
   - Change `DEBUG` to `False`
   - Update `SECRET_KEY` to a secure value
   - Update `ALLOWED_HOSTS` with your domain

2. **Build and start containers:**
```bash
docker-compose up -d
```

### Windows Deployment with Docker

1. Install Docker Desktop for Windows
2. Clone the repository
3. Navigate to project directory
4. Run: `docker-compose up -d`

### Ubuntu Deployment with Docker

1. Install Docker Engine and Docker Compose
2. Clone the repository
3. Navigate to project directory
4. Run: `docker-compose up -d`

## Troubleshooting

### Database connection errors
- Ensure PostgreSQL is running
- Check credentials in `.env` file
- Verify database exists

### Port already in use
Change port mappings in `docker-compose.yml`:
```yaml
ports:
  - "8001:8000"  # Change 8000 to any available port
```

### Frontend won't load
- Ensure backend API is running and accessible
- Check browser console for CORS errors
- Verify API URL in frontend environment

## Development Tips

### Running tests
```bash
cd backend
python manage.py test
```

### Database migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Creating superuser for admin
```bash
cd backend
python manage.py createsuperuser
```

Admin panel: http://localhost:8000/admin

## Next Steps

1. Implement drag-and-drop functionality for reordering libraries and bookshelves
2. Add edit/create modals for all entities
3. Implement borrowing workflow UI
4. Add search and filtering capabilities
5. Create detailed book management views
6. Add customer dashboard
7. Implement notifications for overdue books
