import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { Library, Bookshelf } from '@/types'

export const useDragAndDrop = () => {
  const sensors = useSensors(
    useSensor(PointerSensor, { distance: 8 }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleLibraryDragEnd = async (active: any, over: any, libraries: Library[], setLibraries: any) => {
    if (!over || active.id === over.id) return

    const oldIndex = libraries.findIndex((lib: Library) => lib.id === active.id)
    const newIndex = libraries.findIndex((lib: Library) => lib.id === over.id)

    const newOrder = arrayMove(libraries, oldIndex, newIndex)
    setLibraries(newOrder)

    try {
      await Promise.all(
        newOrder.map((lib, index) =>
          fetch(`/api/libraries/${lib.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: index }),
          })
        )
      )
    } catch (err) {
      console.error('Failed to update library order:', err)
    }
  }

  const handleBookshelfDragEnd = async (active: any, over: any, bookshelves: Bookshelf[], setBookshelves: any) => {
    if (!over || active.id === over.id) return

    const oldIndex = bookshelves.findIndex((shelf: Bookshelf) => shelf.id === active.id)
    const newIndex = bookshelves.findIndex((shelf: Bookshelf) => shelf.id === over.id)

    const newOrder = arrayMove(bookshelves, oldIndex, newIndex)
    setBookshelves(newOrder)

    try {
      await Promise.all(
        newOrder.map((bs, index) =>
          fetch(`/api/bookshelves/${bs.id}/`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order: index }),
          })
        )
      )
    } catch (err) {
      console.error('Failed to update bookshelf order:', err)
    }
  }

  return {
    DndContext,
    sensors,
    handleLibraryDragEnd,
    handleBookshelfDragEnd,
  }
}
