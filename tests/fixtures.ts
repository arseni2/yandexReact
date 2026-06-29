import {test as base} from '@playwright/test';
import type {HistoryItemType} from '../src/store/slices/history/history';

const HISTORY_STORAGE_KEY = 'history-storage';

type Fixtures = {
    seedHistory: (items: HistoryItemType[]) => Promise<void>;
    clearHistory: () => Promise<void>;
};

export const test = base.extend<Fixtures>({
    seedHistory: async ({page}, use) => {
        const seed = async (items: HistoryItemType[]) => {
            await page.goto('/');
            await page.evaluate(
                ({key, data}) => {
                    localStorage.setItem(key, JSON.stringify({state: {items: data}, version: 0}));
                },
                {key: HISTORY_STORAGE_KEY, data: items},
            );
        };
        await use(seed);
    },

    clearHistory: async ({page}, use) => {
        await use(async () => {
            await page.goto('/');
            await page.evaluate((key) => localStorage.removeItem(key), HISTORY_STORAGE_KEY);
        });
    },
});
