import '@testing-library/jest-dom'
import {describe, expect, it, vi, beforeEach, test} from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import History from '../ui/History'

vi.mock('../../../widgets/HistoryItem/ui/HistoryItem.tsx', () => ({
    default: ({ history, handleClickDelete }: any) => (
        <div>
            <span>{history.name}</span>
            <button onClick={() => handleClickDelete(history.id)} data-testid={`delete-${history.id}`}>
                Удалить
            </button>
        </div>
    )
}))


const mockUseHistoryStore = {
    items: [
        { id: 1, name: 'Report 1', filename: 'file1', date: '', isCompleted: true },
        { id: 2, name: 'Report 2', filename: 'file2', date: '', isCompleted: true }
    ],
    removeHistoryItem: vi.fn(),
    clearHistory: vi.fn()
}

vi.mock('../../../store/slices/history/history', () => ({
    useHistoryStore: () => mockUseHistoryStore
}))


export class HistoryPom {
    get report1() {
        return screen.getByText('Report 1');
    }
    get report2() {
        return screen.getByText('Report 2');
    }
    get deleteBtn1() {
        return screen.getByTestId('delete-1');
    }
    get deleteBtn2() {
        return screen.getByTestId('delete-2');
    }
    get clearBtn() {
        return screen.getByText('Очистить всё');
    }
    get generatorLink() {
        return screen.getByText('Сгенерировать больше');
    }
}

describe('🧪 <History />', () => {
    let pom: HistoryPom;

    beforeEach(() => {
        vi.clearAllMocks();
        render(
            <MemoryRouter initialEntries={['/history']}>
                <Routes>
                    <Route path="/history" element={<History />} />
                </Routes>
            </MemoryRouter>
        );
        pom = new HistoryPom();
    });

    test('рендерит все элементы истории', () => {
        expect(pom.report1).toBeInTheDocument();
        expect(pom.report2).toBeInTheDocument();
    });

    test('вызывает removeHistoryItem при клике по кнопке "Удалить"', () => {
        fireEvent.click(pom.deleteBtn1);
        expect(mockUseHistoryStore.removeHistoryItem).toHaveBeenCalledTimes(1);
        expect(mockUseHistoryStore.removeHistoryItem).toHaveBeenCalledWith(1);
    });

    test('вызывает clearHistory при клике по кнопке "Очистить всё"', () => {
        fireEvent.click(pom.clearBtn);
        expect(mockUseHistoryStore.clearHistory).toHaveBeenCalledTimes(1);
    });

    test('содержит ссылку на "/generator" с правильным текстом', () => {
        expect(pom.generatorLink).toBeInTheDocument();
        expect(pom.generatorLink.parentNode).toHaveAttribute('href', '/generator');
    });
});