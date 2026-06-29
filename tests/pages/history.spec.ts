import {expect, type Locator, type Page} from '@playwright/test';
import {test} from '../fixtures';
import type {HistoryItemType} from '../../src/store/slices/history/history';
import type {AggregatedData} from '../../src/api/analytic/analitycs';

const API_URL = 'http://localhost:3000';

const MOCK_DATA: AggregatedData = {
    total_spend_galactic: 150,
    rows_affected: 10,
    less_spent_at: 5,
    big_spent_at: 20,
    less_spent_value: 10,
    big_spent_value: 80,
    average_spend_galactic: 15,
    big_spent_civ: 'CIV_ALPHA',
    less_spent_civ: 'CIV_BETA',
};

function createCompletedItem(overrides?: Partial<HistoryItemType>): HistoryItemType {
    return {
        id: 1,
        filename: 'report.csv',
        date: '25.06.2026',
        isCompleted: true,
        data: MOCK_DATA,
        ...overrides,
    };
}

function createFailedItem(overrides?: Partial<HistoryItemType>): HistoryItemType {
    return {
        id: 2,
        filename: 'broken.csv',
        date: '26.06.2026',
        isCompleted: false,
        ...overrides,
    };
}

class HistoryPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    get items(): Locator {
        return this.page.getByTestId('history-item');
    }

    get deleteBtns(): Locator {
        return this.page.getByTestId('delete-btn');
    }

    get clearAllBtn(): Locator {
        return this.page.getByRole('button', {name: /очистить всё/i});
    }

    get generatorLink(): Locator {
        return this.page.getByRole('link', {name: /сгенерировать больше/i});
    }

    get dialog(): Locator {
        return this.page.getByTestId('history-item-dialog');
    }

    get closeDialogBtn(): Locator {
        return this.page.getByTestId('close-dialog-btn');
    }

    item(fileName: string): Locator {
        return this.items.filter({hasText: fileName}).first();
    }

    deleteBtn(index: number): Locator {
        return this.deleteBtns.nth(index);
    }

    async goto() {
        await this.page.goto('/history');
    }
}

class AnalyticsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    get uploadBtn(): Locator {
        return this.page.getByRole('button', {name: /загрузить файл/i});
    }

    get fileInput(): Locator {
        return this.page.locator('input[type="file"]');
    }

    get sendBtn(): Locator {
        return this.page.getByRole('button', {name: /отправить/i});
    }

    get doneStatus(): Locator {
        return this.page.getByTestId('button-done-file');
    }

    get historyLink(): Locator {
        return this.page.getByRole('link', {name: /история/i});
    }

    async goto() {
        await this.page.goto('/');
    }

    async uploadFile(fileName: string) {
        const fileContent = 'col1,col2\nval1,val2';
        const buffer = Buffer.from(fileContent);
        await this.fileInput.setInputFiles({
            name: fileName,
            mimeType: 'text/csv',
            buffer,
        });
    }
}

function mockAggregateError(page: Page) {
    return page.route(`${API_URL}/aggregate*`, async (route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({error: 'Internal Server Error'}),
        });
    });
}

// ─── 1. Пустая история ───
test('Пустая история — элементы не отображаются', async ({page, clearHistory}) => {
    await clearHistory();
    const history = new HistoryPage(page);

    await history.goto();

    await expect(history.items).toHaveCount(0);
});

test('Пустая история — кнопка "Очистить всё" видна', async ({page, clearHistory}) => {
    await clearHistory();
    const history = new HistoryPage(page);

    await history.goto();

    await expect(history.clearAllBtn).toBeVisible();
});

// ─── 2. Есть история ───
test('Рендерит элементы с корректными данными', async ({page, seedHistory}) => {
    await seedHistory([
        createCompletedItem({filename: 'report.csv', date: '25.06.2026'}),
        createCompletedItem({id: 2, filename: 'data.csv', date: '26.06.2026'}),
    ]);
    const history = new HistoryPage(page);

    await history.goto();

    await expect(history.items).toHaveCount(2);
    await expect(history.item('report.csv')).toBeVisible();
    await expect(history.item('data.csv')).toBeVisible();
});

test('Показывает статус "Обработан успешно" для завершённых', async ({page, seedHistory}) => {
    await seedHistory([createCompletedItem()]);
    const history = new HistoryPage(page);

    await history.goto();

    await expect(history.item('report.csv').getByText(/обработан успешно/i)).toBeVisible();
});

test('Показывает статус "Не удалось обработать" для незавершённых', async ({page, seedHistory}) => {
    await seedHistory([createFailedItem()]);
    const history = new HistoryPage(page);

    await history.goto();

    await expect(history.item('broken.csv').getByText(/не удалось обработать/i)).toBeVisible();
});

// ─── 3. Удаление элемента ───
test('Удаляет элемент по клику на иконку удаления', async ({page, seedHistory}) => {
    await seedHistory([
        createCompletedItem({filename: 'first.csv'}),
        createCompletedItem({id: 2, filename: 'second.csv'}),
    ]);
    const history = new HistoryPage(page);

    await history.goto();
    await expect(history.items).toHaveCount(2);

    await history.deleteBtn(0).click();

    await expect(history.item('first.csv')).not.toBeVisible();
    await expect(history.item('second.csv')).toBeVisible();
});

// ─── 4. Очистка всей истории ───
test('Очищает все элементы по клику "Очистить всё"', async ({page, seedHistory}) => {
    await seedHistory([
        createCompletedItem({filename: 'a.csv'}),
        createCompletedItem({id: 2, filename: 'b.csv'}),
        createCompletedItem({id: 3, filename: 'c.csv'}),
    ]);
    const history = new HistoryPage(page);

    await history.goto();
    await expect(history.items).toHaveCount(3);

    await history.clearAllBtn.click();

    await expect(history.items).toHaveCount(0);
});

// ─── 5. Навигация ───
test('Клик "Сгенерировать больше" переходит на /generator', async ({page, seedHistory}) => {
    await seedHistory([createCompletedItem()]);
    const history = new HistoryPage(page);

    await history.goto();
    await history.generatorLink.click();

    await expect(page).toHaveURL(/\/generator/);
});

// ─── 6. Диалог ───
test('Открывает модалку при клике на завершённый элемент', async ({page, seedHistory}) => {
    await seedHistory([createCompletedItem()]);
    const history = new HistoryPage(page);

    await history.goto();
    await history.item('report.csv').click();

    await expect(history.dialog).toBeVisible();
    await expect(history.dialog).toContainText('общие расходы в галактических кредитах');
});

test('Не открывает модалку при клике на незавершённый элемент', async ({page, seedHistory}) => {
    await seedHistory([createFailedItem()]);
    const history = new HistoryPage(page);

    await history.goto();
    await history.item('broken.csv').click();

    await expect(history.dialog).not.toBeVisible();
});

test('Закрывает модалку по клику на кнопку закрытия', async ({page, seedHistory}) => {
    await seedHistory([createCompletedItem()]);
    const history = new HistoryPage(page);

    await history.goto();
    await history.item('report.csv').click();
    await expect(history.dialog).toBeVisible();

    await history.closeDialogBtn.click();

    await expect(history.dialog).not.toBeVisible();
});

// ─── 7. Persist ───
test('Данные сохраняются после перезагрузки страницы', async ({page, seedHistory}) => {
    await seedHistory([createCompletedItem({filename: 'persist.csv'})]);
    const history = new HistoryPage(page);

    await history.goto();
    await expect(history.item('persist.csv')).toBeVisible();

    await page.reload();

    await expect(history.item('persist.csv')).toBeVisible();
});

// ─── 8. Полный флоу: загрузка файла → история ───
test('Полный флоу: загрузка CSV → данные в истории', async ({page}) => {
    const history = new HistoryPage(page);
    const analytics = new AnalyticsPage(page);

    const chunks = Object.entries(MOCK_DATA)
        .map(([key, value]) => JSON.stringify({[key]: value}))
        .join('\n');

    await analytics.goto();
    await analytics.uploadFile('e2e-report.csv');

    await page.evaluate((body: string) => {
        const origFetch = window.fetch;
        window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
            const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
            if (url.includes('/aggregate')) {
                const stream = new ReadableStream({
                    start(controller) {
                        controller.enqueue(new TextEncoder().encode(body));
                        controller.close();
                    },
                });
                return new Response(stream, { status: 200 });
            }
            return origFetch.call(window, input, init);
        };
    }, chunks);

    await analytics.sendBtn.click();
    await expect(analytics.doneStatus).toBeVisible({timeout: 15_000});

    await analytics.historyLink.click();
    await expect(page).toHaveURL(/\/history/);

    await expect(history.item('e2e-report.csv')).toBeVisible();
    await expect(history.item('e2e-report.csv').getByText(/обработан успешно/i)).toBeVisible();
});

// ─── 9. Ошибка API → незавершённый элемент в истории ───
test('Полный флоу: ошибка API → элемент с ошибкой в истории', async ({page}) => {
    const history = new HistoryPage(page);
    const analytics = new AnalyticsPage(page);

    await mockAggregateError(page);

    await analytics.goto();
    await analytics.uploadFile('failed.csv');
    await analytics.sendBtn.click();

    await expect(page.getByTestId('upload-file-btn-error')).toBeVisible({timeout: 10_000});

    await analytics.historyLink.click();
    await expect(page).toHaveURL(/\/history/);

    await expect(history.item('failed.csv')).toBeVisible();
    await expect(history.item('failed.csv').getByText(/не удалось обработать/i)).toBeVisible();
});
