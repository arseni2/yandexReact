import { beforeEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { createCsvGeneratorPOM } from './CsvGeneratorPOM.tsx';
import userEvent from '@testing-library/user-event';
import { generateCsvAPI } from '../../../api/generator/generator';
import { useGeneratorStore } from '../../../store/slices/generator/generator';

vi.mock('../../../api/generator/generator', () => ({
  generateCsvAPI: vi.fn(),
}));

const mockedGenerateCsvAPI = vi.mocked(generateCsvAPI);

const CSV_DATA = 'name,email\nJohn,john@example.com';

function stubDownload() {
  const mockClick = vi.fn();
  const originalCreateElement = document.createElement.bind(document);
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'a') {
      const el = originalCreateElement(tag);
      el.click = mockClick;
      return el;
    }
    return originalCreateElement(tag);
  });
  return mockClick;
}

describe('Страница CsvGenerator', () => {
  let pom: ReturnType<typeof createCsvGeneratorPOM>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    useGeneratorStore.setState({ file: { data: '', isCompleted: false } });
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'mocked-url'),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    pom = createCsvGeneratorPOM();
  });

  // ─── UI / Рендер ───

  test('Рендерит заголовок', () => {
    pom.render();
    expect(pom.title).toBeInTheDocument();
  });

  test('Рендерит кнопку начать генерацию', async () => {
    pom.render();
    const button = await pom.getButtonStartGenerate();
    expect(button).toBeInTheDocument();
  });

  test('В начальном состоянии не показывает лоадер, done, error', () => {
    pom.render();
    expect(pom.queryLoadingButton).not.toBeInTheDocument();
    expect(pom.queryDoneButton).not.toBeInTheDocument();
    expect(pom.queryErrorButton).not.toBeInTheDocument();
  });

  // ─── Переходы состояний ───

  test('Показывает лоадер при нажатии кнопки', async () => {
    mockedGenerateCsvAPI.mockImplementation(() => new Promise(() => {}));

    pom.render();
    const generateButton = await pom.getButtonStartGenerate();
    await userEvent.click(generateButton);

    const loadingButton = await pom.getButtonLoadingGenerate();
    expect(loadingButton).toBeInTheDocument();
  });

  test('Во время loading не видна кнопка начать генерацию', async () => {
    mockedGenerateCsvAPI.mockImplementation(() => new Promise(() => {}));

    pom.render();
    const generateButton = await pom.getButtonStartGenerate();
    await userEvent.click(generateButton);

    expect(pom.queryStartButton).not.toBeInTheDocument();
  });

  test('Показывает Done при успешной генерации', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);

    pom.render();
    const generateButton = await pom.getButtonStartGenerate();
    await userEvent.click(generateButton);

    const doneButton = await pom.getButtonDoneGenerate();
    expect(doneButton).toBeInTheDocument();
  });

  test('Показывает ошибку при неудачном запросе', async () => {
    mockedGenerateCsvAPI.mockRejectedValue(new Error('Network error'));

    pom.render();
    const generateButton = await pom.getButtonStartGenerate();
    await userEvent.click(generateButton);

    const errorButton = await pom.getButtonErrorGenerate();
    expect(errorButton).toBeInTheDocument();
  });

  test('Close на error-состоянии возвращает к кнопке начать генерацию', async () => {
    mockedGenerateCsvAPI.mockRejectedValue(new Error('fail'));

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());
    const errorButton = await pom.getButtonErrorGenerate();

    await userEvent.click(pom.getCloseButtonFor(errorButton));

    const startButton = await pom.getButtonStartGenerate();
    expect(startButton).toBeInTheDocument();
  });

  test('Close на done-состоянии возвращает к кнопке начать генерацию', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());
    const doneButton = await pom.getButtonDoneGenerate();

    await userEvent.click(pom.getCloseButtonFor(doneButton));

    const startButton = await pom.getButtonStartGenerate();
    expect(startButton).toBeInTheDocument();
  });

  test('После закрытия done можно начать генерацию заново', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());
    await userEvent.click(
      pom.getCloseButtonFor(await pom.getButtonDoneGenerate())
    );

    const startButton = await pom.getButtonStartGenerate();
    await userEvent.click(startButton);

    const doneButton = await pom.getButtonDoneGenerate();
    expect(doneButton).toBeInTheDocument();
  });

  // ─── API / Store ───

  test('generateCsvAPI вызывается с правильными параметрами', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());

    expect(mockedGenerateCsvAPI).toHaveBeenCalledWith({
      maxSpend: '1000',
      size: 0.001,
      withErrors: 'off',
    });
  });

  test('После ошибки store.file остаётся пустым', async () => {
    mockedGenerateCsvAPI.mockRejectedValue(new Error('fail'));

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());
    await pom.getButtonErrorGenerate();

    expect(useGeneratorStore.getState().file).toEqual({
      data: '',
      isCompleted: false,
    });
  });

  test('После успеха store.file содержит данные и isCompleted', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());
    await pom.getButtonDoneGenerate();

    expect(useGeneratorStore.getState().file).toEqual({
      data: CSV_DATA,
      isCompleted: true,
    });
  });

  test('Close на error сбрасывает store.file', async () => {
    mockedGenerateCsvAPI.mockRejectedValue(new Error('fail'));

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());
    await userEvent.click(
      pom.getCloseButtonFor(await pom.getButtonErrorGenerate())
    );

    expect(useGeneratorStore.getState().file).toEqual({
      data: '',
      isCompleted: false,
    });
  });

  // ─── Download ───

  test('Скачивает файл после успешной генерации', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);
    const mockClick = stubDownload();

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());

    expect(mockClick).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  test('Download создаёт Blob с типом text/csv', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);
    stubDownload();

    const OriginalBlob = global.Blob;
    let blobArgs: unknown[] = [];
    class MockBlob extends OriginalBlob {
      constructor(...args: unknown[]) {
        blobArgs = args;
        super(args[0] as BlobPart[], args[1] as BlobPropertyBag);
      }
    }
    vi.stubGlobal('Blob', MockBlob);

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());

    expect(blobArgs[0]).toEqual([CSV_DATA]);
    expect(blobArgs[1]).toEqual({ type: 'text/csv;charset=utf-8;' });

    vi.stubGlobal('Blob', OriginalBlob);
  });

  test('Download вызывает revokeObjectURL', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);
    stubDownload();

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mocked-url');
  });

  test('Скачиваемый файл имеет имя file.csv', async () => {
    mockedGenerateCsvAPI.mockResolvedValue(CSV_DATA);
    stubDownload();

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());

    const anchor = vi
      .mocked(document.createElement)
      .mock.results.find((r) => r.value?.tagName === 'A')?.value;
    expect(anchor).toBeDefined();
    expect(anchor!.getAttribute('download')).toBe('file.csv');
  });

  // ─── Edge cases ───

  test('Кнопка исчезает после клика — повторный клик невозможен', async () => {
    mockedGenerateCsvAPI.mockImplementation(() => new Promise(() => {}));

    pom.render();
    const generateButton = await pom.getButtonStartGenerate();
    await userEvent.click(generateButton);

    expect(pom.queryStartButton).not.toBeInTheDocument();
    expect(mockedGenerateCsvAPI).toHaveBeenCalledTimes(1);
  });

  test('console.error вызывается при ошибке API', async () => {
    mockedGenerateCsvAPI.mockRejectedValue(new Error('Network error'));

    pom.render();
    await userEvent.click(await pom.getButtonStartGenerate());
    await pom.getButtonErrorGenerate();

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Error while fetching file data.' })
    );
  });
});
