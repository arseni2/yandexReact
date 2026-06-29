import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import History from '../ui/History';

export const createHistoryPOM = () => {
    const user = userEvent.setup();

    const renderComponent = () => {
        render(
            <MemoryRouter initialEntries={['/history']}>
                <Routes>
                    <Route path="/history" element={<History/>}/>
                </Routes>
            </MemoryRouter>,
        );
    };

    return {
        renderComponent,
        user,
        get report1() {
            return screen.getByText('file1');
        },
        get report2() {
            return screen.getByText('file2');
        },
        get deleteBtn1() {
            return screen.getByTestId('delete-1');
        },
        get deleteBtn2() {
            return screen.getByTestId('delete-2');
        },
        get clearBtn() {
            return screen.getByText('Очистить всё');
        },
        get generatorLink() {
            return screen.getByText('Сгенерировать больше');
        },
    };
};
