import { generateCsvAPI } from '../../../api/generator/generator.ts'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {useGeneratorStore} from "./generator.ts";

vi.mock('../../../api/generator/generator', () => ({
    generateCsvAPI: vi.fn(),
}))

describe('useGeneratorStore', () => {
    beforeEach(() => {
        useGeneratorStore.setState({
            file: {
                data: '',
                isCompleted: false,
            },
        })
        vi.clearAllMocks()
    })

    test('должен инициализироваться с пустыми данными', () => {
        const state = useGeneratorStore.getState()

        expect(state.file).toEqual({
            data: '',
            isCompleted: false,
        })
    })

    test('fetchGenerator должен загрузить данные и обновить стор', async () => {
        const mockCSVData = 'name,email\nJohn,john@example.com';
        (generateCsvAPI as any).mockResolvedValue(mockCSVData)

        await useGeneratorStore.getState().fetchGenerator()

        const state = useGeneratorStore.getState()

        expect(generateCsvAPI).toHaveBeenCalled()
        expect(state.file).toEqual({
            data: mockCSVData,
            isCompleted: true,
        })
    })

    test('fetchGenerator должен установить пустые данные при ошибке', async () => {
        ;(generateCsvAPI as any).mockRejectedValue(new Error('API error'))

        try {
            await useGeneratorStore.getState().fetchGenerator()
        } catch (e) {
            // Ожидаем ошибку
        }

        const state = useGeneratorStore.getState()

        expect(generateCsvAPI).toHaveBeenCalled()
        expect(state.file).toEqual({
            data: '',
            isCompleted: false,
        })
    })

    test('clearFile должен сбросить файл в начальное состояние', () => {
        useGeneratorStore.setState({
            file: {
                data: 'test',
                isCompleted: true,
            },
        })

        useGeneratorStore.getState().clearFile()

        const state = useGeneratorStore.getState()

        expect(state.file).toEqual({
            data: '',
            isCompleted: false,
        })
    })
})