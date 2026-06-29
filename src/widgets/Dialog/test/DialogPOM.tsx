import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {vi} from 'vitest';
import Dialog from '../ui/Dialog';

export const createDialogPOM = () => {
    const user = userEvent.setup();
    const mockSetIsOpen = vi.fn();

    const renderComponent = (isOpen = true) => {
        let root = document.getElementById('root');
        if (!root) {
            root = document.createElement('div');
            root.id = 'root';
            document.body.appendChild(root);
        }

        render(
            <Dialog isOpen={isOpen} setIsOpen={mockSetIsOpen}>
                <span>Dialog content</span>
            </Dialog>,
        );
    };

    return {
        renderComponent,
        user,
        mockSetIsOpen,
        get overlay() {
            return document.querySelector('[class*="overlay"]') as HTMLElement;
        },
        get closeBtn() {
            return screen.getByTestId('close-dialog-btn');
        },
        get modal() {
            return document.querySelector('[class*="modal"]') as HTMLElement;
        },
        get content() {
            return screen.getByText('Dialog content');
        },
    };
};
