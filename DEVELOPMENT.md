# Development Guide

## Architecture Overview

### Backend Architecture
- **Framework**: Django with Django Ninja for REST API
- **Database**: PostgreSQL
- **Structure**: Modular apps for each domain (Libraries, Bookshelves, Shelves, Books, Customers, Borrowings)

### Frontend Architecture  
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: React Icons
- **HTTP Client**: Axios

### Data Model Relationships

```
Library
├── Bookshelves (one-to-many)
│   └── Shelves (one-to-many)
│       └── Books (one-to-many)
│
├── Customers (through Borrowings)
│   └── Borrowings (one-to-many)
│
└── Customers (separate relation)
    └── Borrowings (one-to-many, tracks book borrow/return)
```

## Backend Development

### Creating a New App

1. Create app folder: `apps/new_feature/`
2. Create files:
   - `models.py` - Database models
   - `admin.py` - Django admin configuration
   - `apps.py` - App configuration
   - `__init__.py` - Package init

3. Add app to `INSTALLED_APPS` in `settings.py`

### Adding API Endpoints

1. Define schemas in `api/schemas.py`
2. Add router functions in `api/router.py`
3. Use Ninja decorators:
   - `@router.get()` - GET requests
   - `@router.post()` - POST requests
   - `@router.put()` - PUT requests
   - `@router.delete()` - DELETE requests

Example:
```python
@router.get("/items/", response=List[ItemSchema])
def list_items(request):
    return Item.objects.all()

@router.post("/items/", response=ItemSchema)
def create_item(request, payload: ItemCreateSchema):
    return Item.objects.create(**payload.dict())
```

### Database Migrations

Create migration after model changes:
```bash
python manage.py makemigrations
python manage.py migrate
```

## Frontend Development

### Component Structure

Components follow a consistent pattern:
```typescript
interface Props {
  // Props definition
}

export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Component logic
  return (
    // JSX
  )
}
```

### API Integration

Use services from `services/api.ts`:
```typescript
import { libraryService } from '@/services/api'

const response = await libraryService.getAll()
const library = response.data
```

### State Management

Currently using React hooks. For larger app, consider Redux or Zustand:
```typescript
const [items, setItems] = useState<Item[]>([])

useEffect(() => {
  loadItems()
}, [])
```

### Styling with Tailwind

All styling uses Tailwind CSS utilities. Examples:
```tsx
<div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h3 className="text-lg font-semibold text-gray-800">Title</h3>
</div>
```

## Common Tasks

### Add a New Entity Type

1. **Backend**:
   - Create `apps/entity_name/models.py` with model
   - Create `apps/entity_name/admin.py` with admin config
   - Create `apps/entity_name/apps.py` with app config
   - Add app to `INSTALLED_APPS`
   - Create migration: `python manage.py makemigrations`
   - Define schema in `api/schemas.py`
   - Add routes in `api/router.py`

2. **Frontend**:
   - Create type in `types/index.ts`
   - Add API service in `services/api.ts`
   - Create component in `components/EntityName.tsx`
   - Create page in `pages/EntityName.tsx`

### Add Drag-and-Drop

The application is configured for `react-beautiful-dnd`. Example:

```typescript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

<DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="libraries">
    {(provided) => (
      <div {...provided.droppableProps} ref={provided.innerRef}>
        {items.map((item, index) => (
          <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                {/* Content */}
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>
```

### Handle Forms

Create controlled form components:
```typescript
const [formData, setFormData] = useState<EntityRequest>({
  name: '',
  description: '',
})

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value,
  })
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await service.create(formData)
}
```

### Error Handling

```typescript
try {
  const response = await api.get('/endpoint')
  setData(response.data)
} catch (error) {
  if (axios.isAxiosError(error)) {
    setError(error.response?.data?.message || 'An error occurred')
  } else {
    setError('An unknown error occurred')
  }
}
```

## Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
Frontend testing infrastructure not yet configured. To add:
```bash
cd frontend
npm install --save-dev vitest @testing-library/react
```

## Performance Optimization

### Backend
- Use `select_related()` for foreign keys
- Use `prefetch_related()` for reverse relationships
- Add database indexes to frequently queried fields
- Cache frequently accessed data

### Frontend
- Use React.memo for component memoization
- Lazy load heavy components
- Optimize images
- Use production build for deployment

## Security Considerations

- **CORS**: Configure in `settings.py` - only allow trusted origins
- **Secrets**: Never commit `.env` files, use secure secret management
- **Validation**: Validate all user input on both frontend and backend
- **Authentication**: Consider adding JWT authentication
- **HTTPS**: Use HTTPS in production

## Debugging

### Backend
```bash
# Increase logging verbosity
DEBUG = True  # Already set in development

# Use Django shell
python manage.py shell

# View database queries
from django.db import connection
from django.test.utils import CaptureQueriesContext
```

### Frontend
- Use React Developer Tools browser extension
- Browser DevTools (F12)
- Network tab for API calls
- Console for errors

## Contributing Guidelines

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test
3. Commit with clear message: `git commit -m "Add feature description"`
4. Push and create pull request

## Useful Commands

### Backend
```bash
# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Shell access
python manage.py shell

# Collect static files
python manage.py collectstatic
```

### Frontend
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

### Docker
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f service_name

# Execute command in container
docker-compose exec service_name command

# Rebuild containers
docker-compose up -d --build
```

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django Ninja Documentation](https://django-ninja.rest-framework.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
