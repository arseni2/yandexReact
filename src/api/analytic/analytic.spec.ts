import { beforeEach, describe, expect, test, vi } from 'vitest';
import { BASE_URL } from '../index';
import {
  aggregateCsvAPI,
  type AggregateCsvPayloadType,
  type AggregatedData,
  DEFAULT_DATA,
} from './analitycs.ts';

function createMockReader(chunks: string[]) {
  let i = 0;
  return {
    read: vi.fn(() =>
      i < chunks.length
        ? Promise.resolve({
            done: false,
            value: new TextEncoder().encode(chunks[i++]),
          })
        : Promise.resolve({ done: true })
    ),
  };
}

function createMockResponse(chunks: string[]) {
  return {
    ok: true,
    body: { getReader: () => createMockReader(chunks) },
  };
}

describe('aggregateCsvAPI', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  test('корректно отправляет запрос и собирает данные из потока', async () => {
    // Arrange
    const file = new File(['content'], 'test.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 1000 };
    const chunks = [
      `{ "total_spend_galactic": 100 }`,
      `{ "rows_affected": 50 }`,
      `{ "big_spent_civ": "CIV1", "less_spent_civ": "CIV2" }`,
    ];
    fetchSpy.mockResolvedValueOnce(createMockResponse(chunks));

    const updates: AggregatedData[] = [];
    const onUpdate = (data: AggregatedData) => updates.push({ ...data });

    const expected = {
      ...DEFAULT_DATA,
      total_spend_galactic: 100,
      rows_affected: 50,
      big_spent_civ: 'CIV1',
      less_spent_civ: 'CIV2',
    };

    // Act
    const result = await aggregateCsvAPI(payload, onUpdate);

    // Assert
    expect(fetchSpy).toHaveBeenCalledWith(`${BASE_URL}/aggregate?rows=1000`, {
      method: 'POST',
      body: expect.any(FormData),
    });
    expect(updates).toHaveLength(3);
    expect(result).toEqual(expected);
  });

  test('добавляет файл в FormData', async () => {
    // Arrange
    const file = new File(['data'], 'data.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 500 };

    let capturedBody: FormData | null = null;
    fetchSpy.mockImplementationOnce((_url: string, init: RequestInit) => {
      capturedBody = init.body as FormData;
      return Promise.resolve(createMockResponse([]));
    });

    // Act
    await aggregateCsvAPI(payload);

    // Assert
    expect(capturedBody).toBeInstanceOf(FormData);
    expect(capturedBody!.get('file')).toBe(file);
  });

  test('вызывает ошибку при неудачном ответе сервера', async () => {
    // Arrange
    const file = new File(['content'], 'test.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 1000 };
    fetchSpy.mockResolvedValueOnce({ ok: false });

    // Act & Assert
    await expect(aggregateCsvAPI(payload)).rejects.toThrow('Ошибка запроса');
  });

  test('вызывает ошибку когда body отсутствует', async () => {
    // Arrange
    const file = new File(['content'], 'test.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 1000 };
    fetchSpy.mockResolvedValueOnce({ ok: true, body: null });

    // Act & Assert
    await expect(aggregateCsvAPI(payload)).rejects.toThrow('Ошибка запроса');
  });

  test('работает без callback onUpdate', async () => {
    // Arrange
    const file = new File(['content'], 'test.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 1000 };
    const chunks = [`{ "total_spend_galactic": 100 }`];
    fetchSpy.mockResolvedValueOnce(createMockResponse(chunks));

    // Act
    const result = await aggregateCsvAPI(payload);

    // Assert
    expect(result).toEqual({ ...DEFAULT_DATA, total_spend_galactic: 100 });
  });

  test('игнорирует невалидные строки в потоке', async () => {
    // Arrange
    const file = new File(['content'], 'test.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 1000 };
    const chunks = [`invalid-json`, `{ "total_spend_galactic": 200 }`];
    fetchSpy.mockResolvedValueOnce(createMockResponse(chunks));

    const updates: AggregatedData[] = [];
    const onUpdate = (data: AggregatedData) => updates.push({ ...data });

    // Act
    const result = await aggregateCsvAPI(payload, onUpdate);

    // Assert
    expect(updates).toHaveLength(1);
    expect(result).toEqual({ ...DEFAULT_DATA, total_spend_galactic: 200 });
  });

  test('возвращает DEFAULT_DATA при пустом потоке', async () => {
    // Arrange
    const file = new File(['content'], 'test.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 1000 };
    fetchSpy.mockResolvedValueOnce(createMockResponse([]));

    // Act
    const result = await aggregateCsvAPI(payload);

    // Assert
    expect(result).toEqual(DEFAULT_DATA);
  });

  test('последнее значение перезаписывает предыдущее при дублирующихся ключах', async () => {
    // Arrange
    const file = new File(['content'], 'test.csv');
    const payload: AggregateCsvPayloadType = { file, rows: 1000 };
    const chunks = [
      `{ "total_spend_galactic": 100 }`,
      `{ "total_spend_galactic": 999 }`,
    ];
    fetchSpy.mockResolvedValueOnce(createMockResponse(chunks));

    // Act
    const result = await aggregateCsvAPI(payload);

    // Assert
    expect(result.total_spend_galactic).toBe(999);
  });
});
