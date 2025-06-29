import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
import UploadForm from "../../../widgets/UploadForm/ui/UploadForm.tsx";
import {MemoryRouter} from "react-router-dom";
import userEvent from '@testing-library/user-event';
import {test} from "vitest";



let isLoading = false;
let response = {total_spend_galactic: 0, rows_affected: 0};
let sendFileMock = vi.fn().mockResolvedValue({total_spend_galactic: 100, rows_affected: 1});

export class UploadFormPom {
    render(ui = <UploadForm/>) {
        render(<MemoryRouter>{ui}</MemoryRouter>)
    }

    get input() {
        return screen.getByTestId('inputFile');
    }

    get sendBtn() {
        return screen.getByTestId('send-btn');
    }

    get uploadBtn() {
        return screen.getByText(/Загрузить файл/i);
    }

    get fileName() {
        // Находит имя файла после выбора
        return screen.queryByText(/\.csv$/i);
    }

    get errorTitle() {
        return screen.queryByText('Ошибка');
    }

    get errorDescription() {
        return screen.queryByText('упс, не то...');
    }

    async uploadFile(file: File) {
        await userEvent.upload(this.input, file);
    }

    async clickSend() {
        await userEvent.click(this.sendBtn);
    }
}

vi.mock('../../../store/slices/analytic/analytic', () => ({
    useAnalyticStore: () => ({
        isLoading,
        response,
        sendFile: (...args) => sendFileMock(...args),
        resetStore: vi.fn(),
    }),
}));

vi.mock('../../../store/slices/history/history', () => ({
    useHistoryStore: () => ({
        addHistoryItem: vi.fn(),
        removeHistoryItem: vi.fn(),
        clearHistory: vi.fn(),
        items: [],
    }),
}));

describe('<UploadForm />', () => {
    let pom: UploadFormPom;

    beforeEach(() => {
        isLoading = false;
        response = { total_spend_galactic: 0, rows_affected: 0 };
        sendFileMock = vi.fn().mockResolvedValue({ total_spend_galactic: 100, rows_affected: 1 });

        pom = new UploadFormPom();
        pom.render()
    });

    test('рендерит заголовок и кнопку загрузки', () => {
        expect(screen.getByText(/Загрузите/i)).toBeInTheDocument();
        expect(pom.uploadBtn).toBeInTheDocument();
    });

    test('разрешает загрузку csv файла', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', { type: 'text/csv' });
        await pom.uploadFile(file);
        expect(await screen.findByText(/test\.csv/i)).toBeInTheDocument();
    });

    test('кнопка "Отправить" становится активной после выбора файла', async () => {
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', { type: 'text/csv' });
        await pom.uploadFile(file);
        expect(await screen.findByTestId('send-btn')).not.toBeDisabled();
    });

    test('отображает ошибку при ошибке отправки файла', async () => {
        sendFileMock = vi.fn().mockRejectedValue(new Error('file error'));
        const file = new File(['a,b,c\n1,2,3'], 'test.csv', { type: 'text/csv' });
        await pom.uploadFile(file);
        await pom.clickSend();
        expect(await screen.findByText('Ошибка')).toBeInTheDocument();
        expect(screen.getByText('упс, не то...')).toBeInTheDocument();
    });
});