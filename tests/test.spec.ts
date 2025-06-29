import {expect, Locator, Page, test} from '@playwright/test';

export class AnalyticsPage {
  readonly page: Page;
  readonly uploadBtn: Locator;
  readonly fileInput: Locator;
  readonly sendBtn: Locator;
  readonly statusText: Locator;
  readonly historyLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.uploadBtn = page.getByRole('button', { name: /загрузить файл/i });
    this.fileInput = page.locator('input[type="file"]');
    this.sendBtn = page.getByRole('button', { name: /отправить/i });
    this.statusText = page.getByText(/готово!|ошибка/i);
    this.historyLink = page.getByRole('link', { name: /история/i });
  }

  async goto() {
    await this.page.goto('http://localhost:5173/');
  }

  async uploadFile(fileName: string, expectSuccess = true) {
    await this.uploadBtn.click();
    await this.fileInput.setInputFiles(fileName);
    await this.sendBtn.click();
    if (expectSuccess) {
      await this.expectStatusVisible();
    }
  }

  // async expectErrorStatusVisible() {
  //   await expect(this.page.getByTestId("upload-file-btn-error")).toBeVisible({timeout: 10_000});
  // }

  async expectStatusVisible() {
    await expect(this.statusText).toBeVisible();
  }

  async goToHistory() {
    await this.historyLink.click();
  }
}

export class HistoryPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  historyItem(fileName: string): Locator {
    return this.page.getByTestId('history-item').filter({ hasText: fileName }).first();
  }

  dialog(): Locator {
    return this.page.getByTestId('history-item-dialog').first();
  }

  closeDialogBtn(): Locator {
    return this.page.getByTestId('close-dialog-btn');
  }
}

test('Успешная загрузка файла на странице с аналитикой и просмотр истории с открытием модалки', async ({ page }) => {
  const fileName = 'file.csv';
  const analytics = new AnalyticsPage(page);
  const history = new HistoryPage(page);

  await analytics.goto();
  await analytics.uploadFile(fileName);
  await analytics.expectStatusVisible();
  await analytics.goToHistory();

  const historyItem = history.historyItem(fileName);
  await expect(historyItem).toBeVisible();

  await historyItem.click();

  const dialog = history.dialog();
  await expect(dialog).toBeVisible();

  await history.closeDialogBtn().click();
  await expect(dialog).not.toBeVisible();
});
