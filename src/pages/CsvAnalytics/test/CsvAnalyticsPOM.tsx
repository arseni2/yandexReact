import '@testing-library/jest-dom'
import {render, screen, fireEvent, type Matcher} from '@testing-library/react';
import UploadForm from "../../../widgets/UploadForm/ui/UploadForm.tsx";
import {MemoryRouter} from "react-router-dom";
import userEvent from '@testing-library/user-event';

class CsvAnalyticsPOM {
    render() {
        render(
            <MemoryRouter>
                <UploadForm/>
            </MemoryRouter>
        )
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

    get uploadFileBtn() {
        return screen.getByTestId('upload-file-btn');
    }

    get fileName() {
        return screen.queryByText(/\.csv$/i);
    }

    get errorTitle() {
        return screen.queryByText('Ошибка');
    }

    get errorBtn() {
        return screen.getByTestId('upload-file-btn-error');
    }

    get errorDescription() {
        return screen.queryByText('упс, не то...');
    }

    get doneBtn() {
        return screen.getByTestId('button-done-file');
    }

    get loadingText() {
        return screen.getByText(/идёт парсинг файла/i);
    }

    get placeholder() {
        return screen.getByText(/Здесь.*появятся хайлайты/i);
    }

    get highlightDescriptions() {
        return [
            'общие расходы в галактических кредитах',
            'количество обработанных записей',
            'день года с минимальными расходами',
            'цивилизация с максимальными расходами',
            'цивилизация с минимальными расходами',
            'день года с максимальными расходами',
            'максимальная сумма расходов за день',
            'средние расходы в галактических кредитах',
        ];
    }

    getCloseButtonFor(statusButton: HTMLElement) {
        return statusButton.nextElementSibling as HTMLElement;
    }

    async uploadFile(file: File) {
        await userEvent.upload(this.input, file);
    }

    async clickSend() {
        await userEvent.click(this.sendBtn);
    }

    dropFile(file: File) {
        const dropzone = this.input.parentElement!;

        const dataTransfer = {
            files: [file],
            items: [{kind: 'file', type: file.type, getAsFile: () => file}],
            types: ['Files'],
        };

        fireEvent.drop(dropzone, {dataTransfer});
    }

    dropInvalidFile(type: string, name: string) {
        const file = new File(['content'], name, {type});
        this.dropFile(file);
        return file;
    }

    dropValidCsvFile(name = 'test.csv') {
        const file = new File(['col1,col2\nval1,val2'], name, {type: 'text/csv'});
        this.dropFile(file);
        return file;
    }
}

export const createCsvAnalyticsPOM = () => new CsvAnalyticsPOM()
