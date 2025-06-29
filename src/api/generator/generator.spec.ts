import { BASE_URL } from '../index'
import {generateCsvAPI, type GenerateCsvPayloadType} from "./generator.ts";


describe('generateCsvAPI', () => {
    const mockPayload: GenerateCsvPayloadType = {
        size: 100,
        withErrors: 'on',
        maxSpend: '500'
    }

    let fetchSpy: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchSpy = vi.fn()
        vi.stubGlobal('fetch', fetchSpy)
    })

    test('должен отправить корректный GET-запрос', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve('id,name\n1,item')
        } as any)

        await generateCsvAPI(mockPayload)

        const expectedUrl = `${BASE_URL}/report?size=100&withErrors=on&maxSpend=500`

        expect(fetch).toHaveBeenCalledWith(expectedUrl)
        expect(fetchSpy).toHaveBeenCalled()
    })

    test('должен вернуть CSV-данные при успешном ответе', async () => {
        const csvData = 'id,name\n1,item'

        fetchSpy.mockResolvedValueOnce({
            ok: true,
            text: () => Promise.resolve(csvData)
        } as any)

        const result = await generateCsvAPI(mockPayload)

        expect(result).toBe(csvData)
    })

    test('должен выбросить ошибку при неудачном ответе', async () => {
        fetchSpy.mockResolvedValueOnce({
            ok: false
        } as any)

        await expect(generateCsvAPI(mockPayload)).rejects.toThrow('Failed to generate Csv')
    })
})