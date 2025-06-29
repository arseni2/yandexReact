import {BASE_URL} from "../index.ts";

export type AggregateCsvPayloadType = {
    rows: number;
    file: File;
};

export type AggregatedData = {
    total_spend_galactic: number;
    rows_affected: number;
    less_spent_at: number;
    big_spent_at: number;
    less_spent_value: number;
    big_spent_value: number;
    average_spend_galactic: number;
    big_spent_civ: string;
    less_spent_civ: string;
};

export const DEFAULT_DATA: AggregatedData = {
    total_spend_galactic: 0,
    rows_affected: 0,
    less_spent_at: 0,
    big_spent_at: 0,
    less_spent_value: 0,
    big_spent_value: 0,
    average_spend_galactic: 0,
    big_spent_civ: "",
    less_spent_civ: "",
};

export const aggregateCsvAPI = async (
    payload: AggregateCsvPayloadType,
    onUpdate?: (data: AggregatedData) => void
): Promise<AggregatedData> => {
    const formData = new FormData();
    formData.append("file", payload.file);

    const res = await fetch(`${BASE_URL}/aggregate?rows=${payload.rows}`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok || !res.body) throw new Error("Ошибка запроса");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = { ...DEFAULT_DATA };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).trim().split("\n");
        for (const line of lines) {
            try {
                const partial = JSON.parse(line);
                Object.assign(result, partial);
                onUpdate?.(result);
            } catch {
                console.warn("Невалидная строка:", line);
            }
        }
    }

    return result;
};