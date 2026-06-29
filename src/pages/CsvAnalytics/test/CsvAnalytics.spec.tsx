import {beforeEach, describe, expect, test, vi} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createCsvAnalyticsPOM} from './CsvAnalyticsPOM.tsx';
import {aggregateCsvAPI, DEFAULT_DATA} from '../../../api/analytic/analitycs';
import {useAnalyticStore} from '../../../store/slices/analytic/analytic';
import {getDateFromDay} from '../ui/HighlightContainer';

vi.mock('../../../api/analytic/analitycs', () => ({
    aggregateCsvAPI: vi.fn(),
    DEFAULT_DATA: {
        total_spend_galactic: 0,
        rows_affected: 0,
        less_spent_at: 0,
        big_spent_at: 0,
        less_spent_value: 0,
        big_spent_value: 0,
        average_spend_galactic: 0,
        big_spent_civ: "",
        less_spent_civ: "",
    },
}));

const mockedAggregateCsvAPI = vi.mocked(aggregateCsvAPI);

const mockHistoryAdd = vi.fn();

const mockHistoryState = {items: [], addHistoryItem: mockHistoryAdd};

vi.mock('../../../store/slices/history/history', () => ({
    useHistoryStore: Object.assign(
        vi.fn((selector?: (s: any) => any) => selector ? selector(mockHistoryState) : mockHistoryState),
        {
            setState: vi.fn(),
            getState: vi.fn(() => mockHistoryState),
            subscribe: vi.fn(() => vi.fn()),
        },
    ),
}));

const MOCK_SUCCESS_DATA = {
    total_spend_galactic: 100,
    rows_affected: 5,
    less_spent_at: 10,
    big_spent_at: 20,
    less_spent_value: 10,
    big_spent_value: 50,
    average_spend_galactic: 20,
    big_spent_civ: "Civ1",
    less_spent_civ: "Civ2",
};

function mockSuccess() {
    mockedAggregateCsvAPI.mockImplementation(async (_, onUpdate) => {
        onUpdate?.(MOCK_SUCCESS_DATA);
        return MOCK_SUCCESS_DATA;
    });
}

function mockError() {
    mockedAggregateCsvAPI.mockRejectedValue(new Error('Network error'));
}

function mockPending() {
    mockedAggregateCsvAPI.mockImplementation(() => new Promise(() => {}));
}

describe('<UploadForm />', () => {
    let pom: ReturnType<typeof createCsvAnalyticsPOM>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'log').mockImplementation(() => {});
        useAnalyticStore.setState({isLoading: false, response: {...DEFAULT_DATA}});
        mockHistoryAdd.mockReset();
        localStorage.clear();
        pom = createCsvAnalyticsPOM();
        pom.render();
    });

    // ─── 1. Начальное состояние ───

    test('Рендерит заголовок и кнопку загрузки', () => {
        expect(screen.getByText(/Загрузите/i)).toBeInTheDocument();
        expect(pom.uploadBtn).toBeInTheDocument();
        expect(pom.sendBtn).toBeDisabled();
    });

    test('Placeholder "Здесь появятся хайлайты" виден до отправки', () => {
        expect(pom.placeholder).toBeInTheDocument();
    });

    // ─── 2. Загрузка файла ───

    test('Разрешает загрузку csv файла', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        await pom.uploadFile(file);
        expect(pom.fileName).toBeInTheDocument();
    });

    test('Кнопка "Отправить" активна после выбора файла', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        await pom.uploadFile(file);
        expect(pom.sendBtn).not.toBeDisabled();
    });

    // ─── 3. Drag & drop ───

    test('Drag & drop корректного CSV-файла устанавливает файл', () => {
        const file = pom.dropValidCsvFile();
        expect(pom.fileName).toBeInTheDocument();
        expect(pom.sendBtn).not.toBeDisabled();
    });

    test('Drag & drop некорректного типа файла показывает ошибку', () => {
        pom.dropInvalidFile('text/plain', 'readme.txt');
        expect(pom.errorTitle).toBeInTheDocument();
        expect(pom.errorDescription).toBeInTheDocument();
    });

    test('Drag & drop пустого файла показывает ошибку', () => {
        const emptyFile = new File([''], 'empty.csv', {type: 'text/csv'});
        pom.dropFile(emptyFile);
        expect(pom.errorTitle).toBeInTheDocument();
    });

    // ─── 4. Отправка ───

    test('Показывает лоадер во время отправки', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockPending();
        await pom.uploadFile(file);
        await pom.clickSend();
        expect(pom.loadingText).toBeInTheDocument();
    });

    test('Показывает Done при успешной отправке', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockSuccess();
        await pom.uploadFile(file);
        await pom.clickSend();
        expect(await screen.findByTestId('button-done-file')).toBeInTheDocument();
    });

    test('Показывает ошибку при ошибке отправки', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockError();
        await pom.uploadFile(file);
        await pom.clickSend();
        expect(await screen.findByText('Ошибка')).toBeInTheDocument();
        expect(screen.getByText('упс, не то...')).toBeInTheDocument();
    });

    test('API вызывается с правильными аргументами', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockSuccess();
        await pom.uploadFile(file);
        await pom.clickSend();
        await screen.findByTestId('button-done-file');
        expect(mockedAggregateCsvAPI).toHaveBeenCalledWith(
            {file, rows: 1000},
            expect.any(Function),
        );
    });

    // ─── 5. Close / Reset ───

    test('Close на success возвращает к начальному состоянию', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockSuccess();
        await pom.uploadFile(file);
        await pom.clickSend();
        const doneBtn = await screen.findByTestId('button-done-file');

        await userEvent.click(pom.getCloseButtonFor(doneBtn));

        expect(pom.placeholder).toBeInTheDocument();
        expect(pom.sendBtn).toBeDisabled();
        expect(useAnalyticStore.getState().response).toEqual(DEFAULT_DATA);
    });

    test('Close на error возвращает к начальному состоянию', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockError();
        await pom.uploadFile(file);
        await pom.clickSend();
        const errorBtn = await screen.findByTestId('upload-file-btn-error');

        await userEvent.click(pom.getCloseButtonFor(errorBtn));

        expect(pom.placeholder).toBeInTheDocument();
        expect(pom.sendBtn).toBeDisabled();
    });

    // ─── 6. Хайлайты ───

    test('Хайлайты отображаются после успешной отправки', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockSuccess();
        await pom.uploadFile(file);
        await pom.clickSend();
        await screen.findByTestId('button-done-file');

        for (const desc of pom.highlightDescriptions) {
            expect(screen.getByText(new RegExp(desc, 'i'))).toBeInTheDocument();
        }
    });

    test('Значения хайлайтов соответствуют данным API', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockSuccess();
        await pom.uploadFile(file);
        await pom.clickSend();
        await screen.findByTestId('button-done-file');

        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Civ1')).toBeInTheDocument();
        expect(screen.getByText('Civ2')).toBeInTheDocument();
    });

    // ─── 7. История ───

    test('Добавляет запись в историю при успешной отправке', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', {type: 'text/csv'});
        mockSuccess();
        await pom.uploadFile(file);
        await pom.clickSend();
        await screen.findByTestId('button-done-file');

        expect(mockHistoryAdd).toHaveBeenCalledTimes(1);
        expect(mockHistoryAdd).toHaveBeenCalledWith(
            expect.objectContaining({filename: 'test.csv', isCompleted: true}),
        );
    });

    test('Добавляет запись об ошибке в историю при неудачной отправке', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'broken.csv', {type: 'text/csv'});
        mockError();
        await pom.uploadFile(file);
        await pom.clickSend();
        await screen.findByText('Ошибка');

        expect(mockHistoryAdd).toHaveBeenCalledTimes(1);
        expect(mockHistoryAdd).toHaveBeenCalledWith(
            expect.objectContaining({filename: 'broken.csv', isCompleted: false}),
        );
    });

    // ─── 8. Повторная загрузка ───

    test('Повторная загрузка после success → close работает корректно', async () => {
        const file = new File(['a,b'], 'first.csv', {type: 'text/csv'});
        mockSuccess();

        // First upload
        await pom.uploadFile(file);
        await pom.clickSend();
        await userEvent.click(pom.getCloseButtonFor(await screen.findByTestId('button-done-file')));

        // Second upload
        const file2 = new File(['c,d'], 'second.csv', {type: 'text/csv'});
        await pom.uploadFile(file2);
        await pom.clickSend();
        const doneBtn = await screen.findByTestId('button-done-file');

        expect(doneBtn).toBeInTheDocument();
        expect(mockHistoryAdd).toHaveBeenCalledTimes(2);
    });
});

describe('getDateFromDay', () => {
    test('День 1 → "1 января"', () => {
        expect(getDateFromDay(1)).toBe('1 января');
    });

    test('День 31 → "31 января"', () => {
        expect(getDateFromDay(31)).toBe('31 января');
    });

    test('День 32 → "1 февраля"', () => {
        expect(getDateFromDay(32)).toBe('1 февраля');
    });

    test('День 59 → "28 февраля" (функция использует фиксированный год)', () => {
        expect(getDateFromDay(59)).toBe('28 февраля');
    });

    test('День 60 → "1 марта"', () => {
        expect(getDateFromDay(60)).toBe('1 марта');
    });

    test('День 365 → "31 декабря"', () => {
        expect(getDateFromDay(365)).toBe('31 декабря');
    });
})
