import {create} from "zustand";
import {persist} from "zustand/middleware";
import type {AggregatedData} from "../../api/analitycs.ts";

export type HistoryItemType = {
    id: number;
    filename: string;
    date: string
    isCompleted: boolean
    data?: AggregatedData
}
type HistoryStore = {
    items: HistoryItemType[];
    addHistoryItem: (item: HistoryItemType) => void;
    removeHistoryItem: (id: number) => void;
    clearHistory: () => void;
}
export const useHistoryStore = create<HistoryStore>()(
    persist(
        (set) => ({
            items: [],

            addHistoryItem: (item ) => set((state) => ({ items: [...state.items, item] })),
            removeHistoryItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
            clearHistory: () => set({ items: [] }),
        }),
        {
            name: 'history-storage',
        },
    ),
)