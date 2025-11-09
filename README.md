# Library Monitor

A comprehensive web application for managing library operations including libraries, bookshelves, shelves, books, and customer borrowing records.

## Features

- **Library Management**: Add, modify, delete, and reorder libraries
- **Bookshelf Management**: Organize bookshelves within libraries with drag-and-drop reordering
- **Shelf Management**: Manage shelves within bookshelves
- **Book Management**: Track books with inventory
- **Customer Management**: Register and manage library customers
- **Borrowing System**: Handle book borrowing and return records
- **Drag-and-Drop Interface**: Intuitive UI for reordering libraries and bookshelves
- **Graphical Icons**: User-friendly interface with visual indicators

## Tech Stack

### Backend
- **Framework**: Django with Django Ninja REST API
- **Database**: PostgreSQL
- **Language**: Python 3.10+

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: React Icons
- **Drag-and-Drop**: React Beautiful DnD

## Project Structure

```
library_monitor/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── library_monitor/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   ├── apps/
│   │   ├── libraries/
│   │   ├── bookshelves/
│   │   ├── shelves/
│   │   ├── books/
│   │   ├── customers/
│   │   └── borrowings/
│   └── api/
│       └── router.py
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── public/
├── docker-compose.yml
└── .gitignore
```

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.10+ (for local development)
- Node.js 18+ (for frontend development)

### Using Docker (Recommended)

```bash
docker-compose up -d
```

Visit `http://localhost:3000` for the frontend and `http://localhost:8000` for the API.

### Local Development

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create a `.env` file in the `backend` directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/library_monitor
ALLOWED_HOSTS=localhost,127.0.0.1
```

## API Endpoints

- `GET/POST /api/libraries/` - List/create libraries
- `GET/PUT/DELETE /api/libraries/{id}/` - Retrieve/update/delete library
- `GET/POST /api/bookshelves/` - List/create bookshelves
- `GET/PUT/DELETE /api/bookshelves/{id}/` - Retrieve/update/delete bookshelf
- `GET/POST /api/shelves/` - List/create shelves
- `GET/PUT/DELETE /api/shelves/{id}/` - Retrieve/update/delete shelf
- `GET/POST /api/books/` - List/create books
- `GET/PUT/DELETE /api/books/{id}/` - Retrieve/update/delete book
- `GET/POST /api/customers/` - List/create customers
- `GET/PUT/DELETE /api/customers/{id}/` - Retrieve/update/delete customer
- `GET/POST /api/borrowings/` - List/create borrowing records
- `GET/PUT/DELETE /api/borrowings/{id}/` - Retrieve/update/delete borrowing record

## Development

### Running Tests
```bash
cd backend
python manage.py test
```

### Database Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

## Deployment

Both Windows and Ubuntu deployment is supported through Docker. See `docker-compose.yml` for configuration.

## License

MIT
