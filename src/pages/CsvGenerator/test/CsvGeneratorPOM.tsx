import '@testing-library/jest-dom'
import {screen, render, type within} from '@testing-library/react';
import CsvGenerator from "../ui/CsvGenerator.tsx";

class CsvGeneratorPOM {
    render() {
        return render(<CsvGenerator />)
    }

    get title() {
        return screen.getByText(/Сгенерируйте готовый csv-файл/i);
    }

    async getButtonStartGenerate() {
        return await screen.findByTestId("button-generate-start")
    }

    async getButtonLoadingGenerate() {
        return await screen.findByTestId("button-generate-loading")
    }

    async getButtonDoneGenerate() {
        return await screen.findByTestId("button-generate-done")
    }

    async getButtonErrorGenerate() {
        return await screen.findByTestId("button-generate-error")
    }

    get queryStartButton() {
        return screen.queryByTestId("button-generate-start");
    }

    get queryLoadingButton() {
        return screen.queryByTestId("button-generate-loading");
    }

    get queryDoneButton() {
        return screen.queryByTestId("button-generate-done");
    }

    get queryErrorButton() {
        return screen.queryByTestId("button-generate-error");
    }

    getCloseButtonFor(statusButton: HTMLElement) {
        return statusButton.nextElementSibling as HTMLElement;
    }
}

export const createCsvGeneratorPOM = () => new CsvGeneratorPOM()
