import React, { useState } from 'react'
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isBefore, isAfter, addMonths, subMonths } from 'date-fns'

interface CustomDatePickerProps {
  value: string // YYYY-MM-DD format
  onChange: (value: string) => void
  disabled?: boolean
  disabledBefore?: string // YYYY-MM-DD format
  disabledAfter?: string // YYYY-MM-DD format
  className?: string
  closePickerOnSelect?: boolean // If true, close the picker after selecting a date
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  disabled = false,
  disabledBefore,
  disabledAfter,
  className = '',
  closePickerOnSelect = true,
}) => {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  )

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = format(selected, 'yyyy-MM-dd')
    onChange(dateString)
    // Close the calendar only if closePickerOnSelect is true
    if (closePickerOnSelect) {
      setShowCalendar(false)
    }
  }

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = format(date, 'yyyy-MM-dd')

    if (disabledBefore && isBefore(date, new Date(disabledBefore))) {
      return true
    }
    if (disabledAfter && isAfter(date, new Date(disabledAfter))) {
      return true
    }
    return false
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the starting day of week (0 = Sunday, 6 = Saturday)
  const startingDayOfWeek = monthStart.getDay()
  const emptyDays = Array(startingDayOfWeek).fill(null)

  const displayValue = value
    ? format(new Date(value), 'dd/MM/yyyy')
    : ''

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={displayValue}
          readOnly
          disabled={disabled}
          onClick={() => !disabled && setShowCalendar(!showCalendar)}
          className={`w-full px-2 py-1 border rounded text-xs cursor-pointer ${
            disabled
              ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'border-gray-300 bg-white'
          } ${className}`}
        />
      </div>

      {showCalendar && !disabled && (
        <div 
          className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 p-3 w-64"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              ←
            </button>
            <span className="text-xs font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              →
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="h-6" />
            ))}
            {days.map((day) => {
              const dayNum = day.getDate()
              const isDisabled = isDateDisabled(dayNum)
              const isSelected = value === format(day, 'yyyy-MM-dd')

              return (
                <button
                  key={dayNum}
                  onClick={() => !isDisabled && handleDateSelect(dayNum)}
                  disabled={isDisabled}
                  className={`h-6 text-xs rounded transition ${
                    isSelected
                      ? 'bg-blue-600 text-white font-medium'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  {dayNum}
                </button>
              )
            })}
          </div>

          {/* Close Button */}
          <div className="mt-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowCalendar(false)}
              className="w-full px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
