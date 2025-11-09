/**
 * API service for communicating with backend
 */

import axios, { AxiosInstance } from 'axios'
import type {
  Library, LibraryRequest,
  Bookshelf, BookshelfRequest,
  Shelf, ShelfRequest,
  Book, BookRequest,
  Customer, CustomerRequest,
  Borrowing, BorrowingRequest,
  ReorderItem,
} from '../types'

const API_BASE_URL = '/api'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============= LIBRARY SERVICES =============

export const libraryService = {
  getAll: () => api.get<Library[]>('/libraries/'),
  getById: (id: number) => api.get<Library>(`/libraries/${id}/`),
  create: (data: Partial<LibraryRequest>) => api.post<Library>('/libraries/', data),
  update: (id: number, data: Partial<LibraryRequest>) => api.put<Library>(`/libraries/${id}/`, data),
  delete: (id: number) => api.delete(`/libraries/${id}/`),
  reorder: (items: ReorderItem[]) => api.post('/libraries/reorder/', items),
}

// ============= BOOKSHELF SERVICES =============

export const bookshelfService = {
  getAll: (libraryId?: number) => api.get<Bookshelf[]>('/bookshelves/', { params: { library_id: libraryId } }),
  getById: (id: number) => api.get<Bookshelf>(`/bookshelves/${id}/`),
  create: (data: Partial<BookshelfRequest>) => api.post<Bookshelf>('/bookshelves/', data),
  update: (id: number, data: Partial<BookshelfRequest>) => api.put<Bookshelf>(`/bookshelves/${id}/`, data),
  delete: (id: number) => api.delete(`/bookshelves/${id}/`),
  reorder: (items: ReorderItem[]) => api.post('/bookshelves/reorder/', items),
}

// ============= SHELF SERVICES =============

export const shelfService = {
  getAll: (bookshelfId?: number) => api.get<Shelf[]>('/shelves/', { params: { bookshelf_id: bookshelfId } }),
  getById: (id: number) => api.get<Shelf>(`/shelves/${id}/`),
  create: (data: Partial<ShelfRequest>) => api.post<Shelf>('/shelves/', data),
  update: (id: number, data: Partial<ShelfRequest>) => api.put<Shelf>(`/shelves/${id}/`, data),
  delete: (id: number) => api.delete(`/shelves/${id}/`),
  reorder: (items: ReorderItem[]) => api.post('/shelves/reorder/', items),
}

// ============= BOOK SERVICES =============

export const bookService = {
  getAll: (shelfId?: number, isAvailable?: boolean) =>
    api.get<Book[]>('/books/', { params: { shelf_id: shelfId, is_available: isAvailable } }),
  getById: (id: number) => api.get<Book>(`/books/${id}/`),
  create: (data: Partial<BookRequest>) => api.post<Book>('/books/', data),
  update: (id: number, data: Partial<BookRequest>) => api.put<Book>(`/books/${id}/`, data),
  delete: (id: number) => api.delete(`/books/${id}/`),
}

// ============= CUSTOMER SERVICES =============

export const customerService = {
  getAll: (isActive?: boolean) => api.get<Customer[]>('/customers/', { params: { is_active: isActive } }),
  getById: (id: number) => api.get<Customer>(`/customers/${id}/`),
  create: (data: Partial<CustomerRequest>) => api.post<Customer>('/customers/', data),
  update: (id: number, data: Partial<CustomerRequest>) => api.put<Customer>(`/customers/${id}/`, data),
  delete: (id: number) => api.delete(`/customers/${id}/`),
}

// ============= BORROWING SERVICES =============

export const borrowingService = {
  getAll: (customerId?: number, isReturned?: boolean) =>
    api.get<Borrowing[]>('/borrowings/', { params: { customer_id: customerId, is_returned: isReturned } }),
  getById: (id: number) => api.get<Borrowing>(`/borrowings/${id}/`),
  create: (data: Partial<BorrowingRequest>) => api.post<Borrowing>('/borrowings/', data),
  update: (id: number, data: Partial<BorrowingRequest>) => api.put<Borrowing>(`/borrowings/${id}/`, data),
  delete: (id: number) => api.delete(`/borrowings/${id}/`),
  returnBook: (id: number) => api.post(`/borrowings/${id}/return/`, {}),
}

export default api
