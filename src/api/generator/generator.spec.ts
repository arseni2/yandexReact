import {beforeEach, describe, expect, test, vi} from 'vitest';
import {BASE_URL} from '../index';
import {generateCsvAPI, type GenerateCsvPayloadType} from './generator.ts';

function createMockResponse(ok: boolean, body?: string) {
    return {
        ok,
        text: () => Promise.resolve(body ?? ''),
    };
}

describe('generateCsvAPI', () => {
    let fetchSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.restoreAllMocks();
        fetchSpy = vi.fn();
        vi.stubGlobal('fetch', fetchSpy);
    });

    test('отправляет GET-запрос с корректным URL', async () => {
        // Arrange
        const payload: GenerateCsvPayloadType = {size: 100, withErrors: 'on', maxSpend: '500'};
        fetchSpy.mockResolvedValueOnce(createMockResponse(true, 'id,name\n1,item'));

        // Act
        await generateCsvAPI(payload);

        // Assert
        expect(fetchSpy).toHaveBeenCalledWith(
            `${BASE_URL}/report?size=100&withErrors=on&maxSpend=500`,
        );
    });

    test('возвращает CSV-данные при успешном ответе', async () => {
        // Arrange
        const payload: GenerateCsvPayloadType = {size: 50, withErrors: 'off', maxSpend: '100'};
        const csvData = 'id,name\n1,item';
        fetchSpy.mockResolvedValueOnce(createMockResponse(true, csvData));

        // Act
        const result = await generateCsvAPI(payload);

        // Assert
        expect(result).toBe(csvData);
    });

    test('выбрасывает ошибку при неудачном ответе', async () => {
        // Arrange
        const payload: GenerateCsvPayloadType = {size: 10, withErrors: 'on', maxSpend: '0'};
        fetchSpy.mockResolvedValueOnce(createMockResponse(false));

        // Act & Assert
        await expect(generateCsvAPI(payload)).rejects.toThrow('Failed to generate Csv');
    });

    test('корректно кодирует разные значения payload в URL', async () => {
        // Arrange
        const payload: GenerateCsvPayloadType = {size: 0, withErrors: 'off', maxSpend: '9999'};
        fetchSpy.mockResolvedValueOnce(createMockResponse(true, ''));

        // Act
        await generateCsvAPI(payload);

        // Assert
        expect(fetchSpy).toHaveBeenCalledWith(
            `${BASE_URL}/report?size=0&withErrors=off&maxSpend=9999`,
        );
    });
});
