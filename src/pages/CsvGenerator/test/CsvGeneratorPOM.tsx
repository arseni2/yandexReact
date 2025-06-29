import '@testing-library/jest-dom'
import {screen, render} from '@testing-library/react';
import CsvGenerator from "../ui/CsvGenerator.tsx";

class CsvGeneratorPOM {
    render() {
        return render(<CsvGenerator />)
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
}

export const csvGeneratorPOM = new CsvGeneratorPOM()