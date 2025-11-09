/**
 * Type definitions for the application
 */

export interface Library {
  id: number
  name: string
  short_description: string
  long_description: string
  description: string
  address: string
  phone: string
  email: string
  order: number
  created_at: string
  updated_at: string
}

export interface Bookshelf {
  id: number
  library_id: number
  name: string
  short_description: string
  long_description: string
  description: string
  location: string
  order: number
  created_at: string
  updated_at: string
}

export interface Shelf {
  id: number
  bookshelf_id: number
  name: string | null
  short_description: string
  long_description: string
  description: string
  order: number
  created_at: string
  updated_at: string
}

export interface Book {
  id: number
  shelf_id: number | null
  title: string
  author: string
  year: number | null
  short_description: string
  long_description: string
  status?: 'storage' | 'library' | 'borrowed'
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  full_name: string
  dob: string | null
  phone: string | null
  short_description: string
  long_description: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  registration_date: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Borrowing {
  id: number
  book_id: number
  customer_id: number
  borrow_date: string
  due_date: string
  return_date: string | null
  notes: string
  created_at: string
  updated_at: string
}

// Create/Update request types
export interface LibraryRequest {
  name: string
  description: string
  address: string
  phone: string
  email: string
  order: number
}

export interface BookshelfRequest {
  library_id: number
  name: string
  description: string
  location: string
  order: number
}

export interface ShelfRequest {
  bookshelf_id: number
  name: string
  description: string
  order: number
}

export interface BookRequest {
  title: string
  author?: string
  year?: number | null
  short_description?: string
  long_description?: string
}

export interface CustomerRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  is_active: boolean
}

export interface BorrowingRequest {
  book_id: number
  customer_id: number
  due_date: string
  notes: string
}

export interface ReorderItem {
  id: number
  order: number
}
