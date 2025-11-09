# Frontend Project Structure Refactoring

This document explains the refactored frontend structure to make the codebase more manageable and maintainable.

## Overview

The monolithic `App.tsx` file (2393 lines) has been split into multiple, focused modules organized by responsibility.

## Directory Structure

```
frontend/src/
├── App.tsx                 # Main component (still in progress - will be refactored)
├── main.tsx               # Entry point
├── styles/
│   └── globals.css
├── types/
│   └── index.ts          # TypeScript type definitions
├── services/
│   └── api.ts            # API utilities
├── components/           # Reusable UI components
│   ├── DashboardClickable.tsx
│   ├── Dashboard.tsx
│   ├── LibraryCard.tsx
│   ├── ShelfList.tsx
│   └── index.ts
├── hooks/                # Custom React hooks (NEW)
│   ├── useLibraries.ts   # Library data management
│   ├── useBooks.ts       # Book data management
│   ├── useUsers.ts       # User data management
│   ├── useDragAndDrop.ts # Drag & drop functionality
│   └── index.ts
└── views/                # Page/view components (NEW)
    ├── DashboardView.tsx      # Main dashboard page
    ├── StorageView.tsx        # Storage books page
    ├── BorrowedView.tsx       # Borrowed books page
    ├── ManageUsersView.tsx    # User management page
    └── index.ts
```

## Module Descriptions

### Hooks (`src/hooks/`)

Custom React hooks that encapsulate business logic and state management:

- **`useLibraries.ts`**: Manages library data
  - State: `libraries`, `allBookshelves`, `allShelves`, `error`
  - Methods: `loadLibraries()`

- **`useBooks.ts`**: Manages book data
  - State: `books`, `error`
  - Methods: `loadAllBooks()`, `handleCreateBook()`, `handleDeleteBook()`

- **`useUsers.ts`**: Manages user data
  - State: `users`, `error`
  - Methods: `loadUsers()`, `handleCreateUser()`, `handleUpdateUser()`, `handleDeleteUser()`

- **`useDragAndDrop.ts`**: Handles drag & drop operations
  - Methods: `handleLibraryDragEnd()`, `handleBookshelfDragEnd()`
  - Configuration: Sensors setup for drag & drop

### Views (`src/views/`)

Page-level components representing different app screens:

- **`DashboardView.tsx`**: Main dashboard with overview cards
- **`StorageView.tsx`**: Books in storage
- **`BorrowedView.tsx`**: Borrowed books
- **`ManageUsersView.tsx`**: User management interface

Each view accepts props for data and callbacks, making them reusable and testable.

## Migration Guide

### Before (Monolithic)
```tsx
import App from './App'  // 2393 lines of everything
```

### After (Modular)
```tsx
import { useBooks, useUsers, useLibraries } from '@/hooks'
import { DashboardView, StorageView } from '@/views'

// Use hooks for logic
const { books, loadAllBooks } = useBooks()

// Use views for UI
<DashboardView books={books} onStorageClick={() => {...}} />
```

## Benefits

1. **Easier to Maintain**: Each file has a single responsibility
2. **Better Testing**: Hooks and views can be tested independently
3. **Code Reusability**: Views and hooks can be easily reused or combined
4. **Faster Development**: Developers can work on different modules without conflicts
5. **Scalability**: Easy to add new features without bloating existing files
6. **IDE Performance**: Smaller files load faster in IDEs

## Next Steps for Complete Refactoring

1. Extract remaining views (`LibrariesView.tsx`, `ManageBooks.tsx`)
2. Extract form modals into separate components
3. Create custom hooks for form handling
4. Consider using Context API or state management library for global state
5. Add unit tests for each hook and view

## Example Usage in App.tsx

```tsx
import { useLibraries, useBooks, useUsers } from '@/hooks'
import { DashboardView, StorageView } from '@/views'

export default function App() {
  // Use hooks for data
  const { libraries, loadLibraries } = useLibraries()
  const { books, loadAllBooks } = useBooks()
  const { users, loadUsers } = useUsers()

  useEffect(() => {
    loadLibraries()
    loadAllBooks()
    loadUsers()
  }, [])

  // Render views
  if (activeTab === 'dashboard') {
    return <DashboardView {...props} />
  }
  if (activeTab === 'storage') {
    return <StorageView books={books} onBackClick={() => setActiveTab('dashboard')} />
  }
  // ... other views
}
```

## File Size Comparison

- **Before**: App.tsx (2393 lines)
- **After**: 
  - App.tsx (reduced, refactored)
  - useLibraries.ts (48 lines)
  - useBooks.ts (62 lines)
  - useUsers.ts (75 lines)
  - useDragAndDrop.ts (56 lines)
  - DashboardView.tsx (45 lines)
  - StorageView.tsx (40 lines)
  - BorrowedView.tsx (42 lines)
  - ManageUsersView.tsx (75 lines)

Total modular size is similar but much more manageable across multiple focused files.
