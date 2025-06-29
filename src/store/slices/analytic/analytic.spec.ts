import { aggregateCsvAPI } from '../../../api/analytic/analitycs.ts'
import { DEFAULT_DATA } from '../../../api/analytic/analitycs.ts'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {useAnalyticStore} from "./analytic.ts";

vi.mock('../../../api/analytic/analitycs', () => ({
    aggregateCsvAPI: vi.fn(),
    DEFAULT_DATA: {
        totalRows: 0,
        uniqueUsers: 0,
        averageSpend: 0,
    },
}))

describe('useAnalyticStore', () => {
    const mockedAggregateCsvAPI = vi.mocked(aggregateCsvAPI)

    beforeEach(() => {
        useAnalyticStore.setState({
            isLoading: false,
            response: DEFAULT_DATA,
        })
        vi.clearAllMocks()
    })

    test('должен инициализироваться с начальными значениями', () => {
        const state = useAnalyticStore.getState()

        expect(state.isLoading).toBe(false)
        expect(state.response).toEqual(DEFAULT_DATA)
    })

    test('sendFile должен обновить response при успешном запросе', async () => {
        const mockResponse = {
            total_spend_galactic: 1,
            rows_affected: 1,
            less_spent_at: 1,
            big_spent_at: 1,
            less_spent_value: 1,
            big_spent_value: 1,
            average_spend_galactic: 1,
            big_spent_civ: "test",
            less_spent_civ: "test",
            };

        mockedAggregateCsvAPI.mockImplementationOnce(async (_, onProgress) => {
            if (onProgress) onProgress(mockResponse)
            return mockResponse
        })

        const file = new File(['content'], 'test.csv')

        await useAnalyticStore.getState().sendFile({ file })

        const state = useAnalyticStore.getState()

        expect(aggregateCsvAPI).toHaveBeenCalledWith(
            { file, rows: 1000 },
            expect.any(Function)
        )
        expect(state.isLoading).toBe(false)
        expect(state.response).toEqual(mockResponse)
    })

    test('sendFile должен установить isLoading = true во время загрузки', async () => {
        mockedAggregateCsvAPI.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    setTimeout(resolve, 100)
                })
        )

        const file = new File(['content'], 'test.csv')

        const promise = useAnalyticStore.getState().sendFile({ file })

        const stateDuringLoading = useAnalyticStore.getState()
        expect(stateDuringLoading.isLoading).toBe(true)

        await promise

        const stateAfter = useAnalyticStore.getState()
        expect(stateAfter.isLoading).toBe(false)
    })

    test('sendFile должен обработать ошибку и оставить начальное состояние', async () => {
        mockedAggregateCsvAPI.mockRejectedValueOnce(new Error('Network error'))

        const file = new File(['content'], 'test.csv')

        try {
            await useAnalyticStore.getState().sendFile({ file })
        } catch (e) {
            expect(e).toBeTruthy()
        }

        const state = useAnalyticStore.getState()

        expect(state.isLoading).toBe(false)
        expect(state.response).toEqual(DEFAULT_DATA)
    })

    test('resetStore должен сбросить состояние', () => {
        useAnalyticStore.setState({
            isLoading: true,
            response: {
                total_spend_galactic: 1,
                rows_affected: 1,
                less_spent_at: 1,
                big_spent_at: 1,
                less_spent_value: 1,
                big_spent_value: 1,
                average_spend_galactic: 1,
                big_spent_civ: "test",
                less_spent_civ: "test",
            },
        })

        useAnalyticStore.getState().resetStore()

        const state = useAnalyticStore.getState()

        expect(state.isLoading).toBe(false)
        expect(state.response).toEqual(DEFAULT_DATA)
    })
})