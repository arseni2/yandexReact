import { describe, it, expect } from 'vitest';
import { formatDate } from './formatDate';

describe('formatDate', () => {
    it('форматирует дату с ведущими нулями для дня и месяца', () => {
        const date = new Date(2023, 1, 5);

        const result = formatDate(date);

        expect(result).toBe('05.02.2023');
    });

    it('форматирует дату без добавления лишних нулей если день или месяц двузначные', () => {
        const date = new Date(2024, 11, 25);

        const result = formatDate(date);

        expect(result).toBe('25.12.2024');
    });

    it('корректно обрабатывает первую дату месяца', () => {
        const date = new Date(2022, 4, 1);

        const result = formatDate(date);

        expect(result).toBe('01.05.2022');
    });

    it('корректно обрабатывает конец года', () => {
        const date = new Date(2021, 11, 31);

        const result = formatDate(date);

        expect(result).toBe('31.12.2021');
    });
});