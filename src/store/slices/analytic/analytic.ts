import {create} from "zustand";
import {aggregateCsvAPI, type AggregatedData, DEFAULT_DATA} from "../../../api/analytic/analitycs.ts";

export type SendFilePayload = {
    file: File;
};

type AnalyticStore = {
    sendFile: (payload: SendFilePayload) => Promise<AggregatedData>;
    response: AggregatedData;
    isLoading: boolean;
    resetStore: () => void;
};
export const useAnalyticStore = create<AnalyticStore>((set) => {
    return {
        isLoading: false,
        response: DEFAULT_DATA,
        sendFile: async (payload) => {
            set({ isLoading: true });
            try {
                return await aggregateCsvAPI(
                    {file: payload.file, rows: 1000},
                    (data) => set({response: data})
                );
            } catch (e) {
                throw new Error(`${e}`);
            } finally {
                set({ isLoading: false });
            }
        },
        resetStore: () => {
            set({ isLoading: false, response: DEFAULT_DATA });
        }
    }
})