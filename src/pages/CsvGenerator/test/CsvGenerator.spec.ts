import {describe, test} from "vitest";
import '@testing-library/jest-dom/vitest'
import {csvGeneratorPOM} from "./CsvGeneratorPOM.tsx";
import {fireEvent} from "@testing-library/dom";
import {useGeneratorStore} from "../../../store/slices/generator/generator.ts";


const mockFetchGenerator = vi.fn();
const mockClearFile = vi.fn();
const mockStore = {
    fetchGenerator: mockFetchGenerator,
    clearFile: mockClearFile,
    file: {
        data: null,
    },
};

vi.mock('../../store/slices/generator/generator', () => ({
    useGeneratorStore: () => mockStore,
}));
vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'mocked-url'),
    revokeObjectURL: vi.fn()
})
describe("страница CsvGenerator", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockStore.file.data = null;
    });

    test("Изначальное состояние", async () => {
        csvGeneratorPOM.render()
        const button =await csvGeneratorPOM.getButtonStartGenerate()
        expect(button).toBeInTheDocument();
    })

    test(`Состояние загрузки при нажатии на кнопку "Начать генерацию"`, async () => {
        mockFetchGenerator.mockImplementationOnce(() =>
            new Promise((resolve) => {
                setTimeout(resolve, 500);
            })
        );

        csvGeneratorPOM.render();

        const generateButton = await csvGeneratorPOM.getButtonStartGenerate();
        fireEvent.click(generateButton);

        const loadingButton = await csvGeneratorPOM.getButtonLoadingGenerate();
        expect(loadingButton).toBeInTheDocument();
    })

    test("Состояние ошибки", async () => {
        mockFetchGenerator.mockRejectedValueOnce(new Error('Network error'));

        csvGeneratorPOM.render()

        const generateButton = await csvGeneratorPOM.getButtonStartGenerate();
        fireEvent.click(generateButton);


        const errorButton = await csvGeneratorPOM.getButtonErrorGenerate()
        expect(errorButton).toBeInTheDocument();
    })

    test("Состояние успешного завершения", async () => {
        const mockCSVData = 'name,email\nJohn,john@example.com';

        mockFetchGenerator.mockResolvedValueOnce(undefined);

        mockStore.fetchGenerator.mockResolvedValueOnce(Promise.resolve());

        useGeneratorStore.setState({
            file: {
                data: mockCSVData,
                isCompleted: true
            }
        });

        csvGeneratorPOM.render();

        const doneButton = await csvGeneratorPOM.getButtonDoneGenerate();
        expect(doneButton).toBeInTheDocument();
    });
})