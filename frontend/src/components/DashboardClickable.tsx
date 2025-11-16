import React, { useState, useEffect } from 'react'
import type { Book, Shelf, Bookshelf, Library, Borrowing } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { borrowingService } from '@/services/api'

interface DashboardClickableProps {
  books: Book[]
  shelves: Shelf[]
  selectedBookshelf: Bookshelf | null
  libraries?: Library[]
  onLibraryClick: () => void
  onBorrowedClick: () => void
  onManageBooks: () => void
  onManageUsers: () => void
}

export default function DashboardClickable({
  books,
  shelves: _shelves,
  selectedBookshelf: _selectedBookshelf,
  libraries = [],
  onLibraryClick,
  onBorrowedClick,
  onManageBooks,
  onManageUsers,
}: DashboardClickableProps) {
  const { t } = useLanguage()
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])

  useEffect(() => {
    loadBorrowings()
  }, [books])

  const loadBorrowings = async () => {
    try {
      const response = await borrowingService.getAll()
      setBorrowings(response.data)
    } catch (err) {
      console.error('Failed to load borrowings:', err)
    }
  }

  const libraryBooks = books.filter(b => b.shelf_id !== null && b.status !== 'borrowed')
  const currentBorrowings = borrowings.filter((b: any) => !b.return_date)

  return (
    <div className="space-y-12">

      {/* Main Action Cards - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Libraries Card */}
        <button
          onClick={onLibraryClick}
          className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-40 cursor-pointer"
        >
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between group-hover:text-white transition-colors duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 group-hover:text-green-100 transition-colors">{t('yourLibraries')}</p>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-white mt-1 transition-colors">{libraries.length}</h3>
              </div>
              <img src="/library.png" alt="Library" className="w-12 h-12 opacity-75 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div>
              <p className="text-lg font-semibold text-gray-700 group-hover:text-white transition-colors mb-1">{t('dashboardManageLibraries')}</p>
              <p className="text-sm text-gray-500 group-hover:text-green-100 transition-colors">{t('dashboardAllBooks')}: {libraryBooks.length}</p>
            </div>
          </div>
        </button>

        {/* Borrowing Card */}
        <button
          onClick={onBorrowedClick}
          className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-40 cursor-pointer"
        >
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between group-hover:text-white transition-colors duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 group-hover:text-purple-100 transition-colors">{t('dashboardBorrowSession')}</p>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-white mt-1 transition-colors">{currentBorrowings.length}</h3>
              </div>
              <div className="text-4xl opacity-75 group-hover:opacity-100 transition-opacity">📚</div>
            </div>
            
            <div>
              <p className="text-lg font-semibold text-gray-700 group-hover:text-white transition-colors mb-1">{t('dashboardManageBorrowings')}</p>
              <p className="text-sm text-gray-500 group-hover:text-green-100 transition-colors">{t('dashboardManageBorrowingsDesc')}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Management Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-gray-600 uppercase tracking-wider px-2">{t('managementTools')}</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manage Books Card */}
          <button
            onClick={onManageBooks}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-left border border-gray-100 hover:border-indigo-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">📖</div>
              <div className="h-8 w-8 rounded-lg bg-indigo-100 group-hover:bg-indigo-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-indigo-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{t('dashboardManageBooks')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('dashboardManageBooksDesc')}</p>
          </button>

          {/* Manage Users Card */}
          <button
            onClick={onManageUsers}
            className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 text-left border border-gray-100 hover:border-cyan-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">👥</div>
              <div className="h-8 w-8 rounded-lg bg-cyan-100 group-hover:bg-cyan-600 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 text-cyan-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">{t('dashboardManageUsers')}</h3>
            <p className="text-sm text-gray-500 mt-1">{t('dashboardManageUsersDesc')}</p>
          </button>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{books.length}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboardTotalBooks')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{libraries.length}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboardTotalLibraries')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{currentBorrowings.length}</p>
          <p className="text-xs text-gray-500 mt-1">{t('dashboardTotalBorrowingCurrently')}</p>
        </div>
      </div>
    </div>
  )
}
