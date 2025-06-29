const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
    removeItem: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});
import {describe, expect, test, vi} from 'vitest'
import {type HistoryItemType} from './history'
import {act, renderHook} from '@testing-library/react'

vi.resetModules()
const { useHistoryStore } = await import('./history')


describe('useHistoryStore', () => {
    test('должен инициализироваться с пустым списком', () => {
        const { result } = renderHook(() => useHistoryStore())
        expect(result.current.items).toEqual([])
    })

    test('addHistoryItem должен добавить новый элемент в историю', () => {
        const newItem: HistoryItemType = {
            id: 1,
            filename: 'test.csv',
            date: '2024-06-01',
            isCompleted: true,
            data: {
                total_spend_galactic: 1,
                big_spent_civ: 'test',
                big_spent_value: 1,
                big_spent_at: 1,
                less_spent_civ: 'test',
                less_spent_value: 1,
                less_spent_at: 1,
                rows_affected: 1,
                average_spend_galactic: 1,
            },
        }

        const { result } = renderHook(() => useHistoryStore())

        act(() => {
            result.current.addHistoryItem(newItem)
        })

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0]).toEqual(newItem)
        expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    test('removeHistoryItem должен удалить элемент по id', () => {
        const item1: HistoryItemType = {
            id: 1,
            filename: 'test1.csv',
            date: '2024-06-01',
            isCompleted: true,
            data: {
                total_spend_galactic: 1,
                big_spent_civ: 'test',
                big_spent_value: 1,
                big_spent_at: 1,
                less_spent_civ: 'test',
                less_spent_value: 1,
                less_spent_at: 1,
                rows_affected: 1,
                average_spend_galactic: 1,
            },
        }

        const item2: HistoryItemType = {
            id: 2,
            filename: 'test2.csv',
            date: '2024-06-02',
            isCompleted: false,
        }

        const { result } = renderHook(() => useHistoryStore())

        act(() => {
            result.current.addHistoryItem(item1)
            result.current.addHistoryItem(item2)
        })

        act(() => {
            result.current.removeHistoryItem(1)
        })

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0].id).toBe(2)
        expect(localStorageMock.setItem).toHaveBeenCalledTimes(4)
    })

    test('clearHistory должен очистить список истории', () => {
        const item: HistoryItemType = {
            id: 1,
            filename: 'test1.csv',
            date: '2024-06-01',
            isCompleted: true,
            data: {
                total_spend_galactic: 1,
                big_spent_civ: 'test',
                big_spent_value: 1,
                big_spent_at: 1,
                less_spent_civ: 'test',
                less_spent_value: 1,
                less_spent_at: 1,
                rows_affected: 1,
                average_spend_galactic: 1,
            },
        }

        const { result } = renderHook(() => useHistoryStore())

        act(() => {
            result.current.addHistoryItem(item)
        })

        act(() => {
            result.current.clearHistory()
        })

        expect(result.current.items).toEqual([])
        expect(localStorageMock.setItem).toHaveBeenCalled()
    })
})
