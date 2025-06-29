import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../ui/Header';
import '@testing-library/jest-dom';


class HeaderPom {
    get analyticLink() {
        return screen.getByText(/CSV Аналитик/i).closest('a');
    }
    get generatorLink() {
        return screen.getByText(/CSV Генератор/i).closest('a');
    }
    get historyLink() {
        return screen.getByText(/История/i).closest('a');
    }
    get allLinks() {
        return [this.analyticLink, this.generatorLink, this.historyLink];
    }
}

describe('<Header /> маршрутизация', () => {
    const renderWithRouter = (initialPath = '/') =>
        render(
            <MemoryRouter initialEntries={[initialPath]}>
                <Header />
            </MemoryRouter>
        );

    let pom: HeaderPom;

    beforeEach(() => {
        pom = new HeaderPom();
    });

    it('отображает все ссылки', () => {
        renderWithRouter();
        pom.allLinks.forEach(link => expect(link).toBeInTheDocument());
    });

    it('подсвечивает активную ссылку "/"', () => {
        renderWithRouter('/');
        expect(pom.analyticLink).toHaveClass(/active/);
        expect(pom.generatorLink).not.toHaveClass(/active/);
        expect(pom.historyLink).not.toHaveClass(/active/);
    });

    it('подсвечивает активную ссылку "/generator"', () => {
        renderWithRouter('/generator');
        expect(pom.generatorLink).toHaveClass(/active/);
        expect(pom.analyticLink).not.toHaveClass(/active/);
        expect(pom.historyLink).not.toHaveClass(/active/);
    });

    it('подсвечивает активную ссылку "/history"', () => {
        renderWithRouter('/history');
        expect(pom.historyLink).toHaveClass(/active/);
        expect(pom.analyticLink).not.toHaveClass(/active/);
        expect(pom.generatorLink).not.toHaveClass(/active/);
    });
});