import { beforeEach, describe, expect, test, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { createHistoryPOM } from './HistoryPOM.tsx';

vi.mock('../../../widgets/HistoryItem/ui/HistoryItem.tsx', () => ({
  default: ({ history, handleClickDelete }: any) => (
    <div>
      <span>{history.filename}</span>
      <button
        onClick={() => handleClickDelete(history.id)}
        data-testid={`delete-${history.id}`}
      >
        Удалить
      </button>
    </div>
  ),
}));

const mockRemoveHistoryItem = vi.fn();
const mockClearHistory = vi.fn();

vi.mock('../../../store/slices/history/history', () => ({
  useHistoryStore: Object.assign(
    vi.fn(() => ({
      items: [
        { id: 1, filename: 'file1', date: '', isCompleted: true },
        { id: 2, filename: 'file2', date: '', isCompleted: true },
      ],
      removeHistoryItem: mockRemoveHistoryItem,
      clearHistory: mockClearHistory,
    })),
    {
      setState: vi.fn(),
      getState: vi.fn(),
      subscribe: vi.fn(() => vi.fn()),
    }
  ),
}));

describe('<History />', () => {
  let pom: ReturnType<typeof createHistoryPOM>;

  beforeEach(() => {
    vi.clearAllMocks();
    pom = createHistoryPOM();
    pom.renderComponent();
  });

  test('Рендерит все элементы истории', () => {
    // Assert
    expect(pom.report1).toBeInTheDocument();
    expect(pom.report2).toBeInTheDocument();
  });

  test('Вызывает removeHistoryItem при клике по кнопке "Удалить"', async () => {
    // Act
    await pom.user.click(pom.deleteBtn1);

    // Assert
    expect(mockRemoveHistoryItem).toHaveBeenCalledTimes(1);
    expect(mockRemoveHistoryItem).toHaveBeenCalledWith(1);
  });

  test('Вызывает clearHistory при клике по кнопке "Очистить всё"', async () => {
    // Act
    await pom.user.click(pom.clearBtn);

    // Assert
    expect(mockClearHistory).toHaveBeenCalledTimes(1);
  });

  test('Содержит ссылку на "/generator" с правильным текстом', () => {
    // Assert
    expect(pom.generatorLink).toBeInTheDocument();
    expect(pom.generatorLink.parentNode).toHaveAttribute('href', '/generator');
  });
});
