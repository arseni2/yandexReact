import {BASE_URL} from '../index'
import {
    aggregateCsvAPI,
    type AggregateCsvPayloadType,
    type AggregatedData,
} from './analitycs.ts'


function createMockReader(chunks: string[]) {
    let i = 0
    return {
        read: vi.fn(() =>
            i < chunks.length
                ? Promise.resolve({ done: false, value: new TextEncoder().encode(chunks[i++]) })
                : Promise.resolve({ done: true })
        )
    }
}

function createMockResponse(chunks: string[]) {
    return {
        ok: true,
        body: { getReader: () => createMockReader(chunks) }
    }
}

describe('aggregateCsvAPI', () => {
    const mockFile = new File(['content'], 'test.csv')
    const mockPayload: AggregateCsvPayloadType = { file: mockFile, rows: 1000 }
    let fetchSpy: ReturnType<typeof vi.fn>

    const defaultResult: AggregatedData = {
        total_spend_galactic: 0,
        rows_affected: 0,
        big_spent_civ: "",
        less_spent_civ: "",
        average_spend_galactic: 0,
        big_spent_at: 0,
        less_spent_at: 0,
        big_spent_value: 0,
        less_spent_value: 0,
    }

    beforeEach(() => {
        fetchSpy = vi.fn()
        vi.stubGlobal('fetch', fetchSpy)
    })

    it('корректно отправляет запрос и собирает данные из потока', async () => {
        const chunks = [
            `{ "total_spend_galactic": 100 }`,
            `{ "rows_affected": 50 }`,
            `{ "big_spent_civ": "CIV1", "less_spent_civ": "CIV2" }`
        ]
        fetchSpy.mockResolvedValueOnce(createMockResponse(chunks))

        let lastUpdate: AggregatedData | null = null
        const onUpdate = (data: AggregatedData) => { lastUpdate = data }

        const expected = {
            ...defaultResult,
            total_spend_galactic: 100,
            rows_affected: 50,
            big_spent_civ: 'CIV1',
            less_spent_civ: 'CIV2'
        }

        const result = await aggregateCsvAPI(mockPayload, onUpdate)

        expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/aggregate?rows=1000`, {
            method: 'POST',
            body: expect.any(FormData)
        })
        expect(lastUpdate).toEqual(expected)
        expect(result).toEqual(expected)
    })

    it('вызывает ошибку при неудачном ответе сервера', async () => {
        fetchSpy.mockResolvedValueOnce({ ok: false })
        await expect(aggregateCsvAPI(mockPayload)).rejects.toThrow('Ошибка запроса')
    })

    it('игнорирует невалидные строки в потоке', async () => {
        const chunks = [
            `invalid-json`,
            `{ "total_spend_galactic": 200 }`
        ]
        fetchSpy.mockResolvedValueOnce(createMockResponse(chunks))

        let lastUpdate: AggregatedData | null = null
        const onUpdate = (data: AggregatedData) => { lastUpdate = data }

        const expected = { ...defaultResult, total_spend_galactic: 200 }

        const result = await aggregateCsvAPI(mockPayload, onUpdate)

        expect(lastUpdate).toEqual(expected)
        expect(result).toEqual(expected)
    })
})