import {beforeEach, describe, expect, test} from 'vitest';
import '@testing-library/jest-dom/vitest';
import {screen} from '@testing-library/react';
import {createDialogPOM} from './DialogPOM.tsx';

describe('<Dialog />', () => {
    let pom: ReturnType<typeof createDialogPOM>;

    beforeEach(() => {
        document.body.innerHTML = '<div id="root"></div>';
        pom = createDialogPOM();
    });

    test('Не рендерит содержимое когда isOpen = false', () => {
        // Act
        pom.renderComponent(false);

        // Assert
        expect(screen.queryByText('Dialog content')).not.toBeInTheDocument();
    });

    test('Рендерит содержимое когда isOpen = true', () => {
        // Act
        pom.renderComponent(true);

        // Assert
        expect(pom.content).toBeInTheDocument();
    });

    test('Вызывает setIsOpen(false) при клике на overlay', async () => {
        // Arrange
        pom.renderComponent(true);

        // Act
        await pom.user.click(pom.overlay);

        // Assert
        expect(pom.mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    test('Вызывает setIsOpen(false) при клике на кнопку закрытия', async () => {
        // Arrange
        pom.renderComponent(true);

        // Act
        await pom.user.click(pom.closeBtn);

        // Assert
        expect(pom.mockSetIsOpen).toHaveBeenCalledWith(false);
    });

    test('Не закрывает диалог при клике на содержимое модала', async () => {
        // Arrange
        pom.renderComponent(true);

        // Act
        await pom.user.click(pom.modal);

        // Assert
        expect(pom.mockSetIsOpen).not.toHaveBeenCalled();
    });
});
