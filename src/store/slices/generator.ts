import {create} from "zustand";
import {generateCsvAPI} from "../../api/generator.ts";

type FileData = string; // например, CSV в виде строки

type GeneratorState = {
    data: FileData;
    isCompleted: boolean;
}

type GeneratorStore = {
    file: GeneratorState;
    clearFile: () => void;
    fetchGenerator: () => Promise<void>;
}
export const useGeneratorStore = create<GeneratorStore>((set) => {
    return {
        file: {
            data: "",
            isCompleted: false
        },

        clearFile: () => {
            set(() => {
                return {
                    file: {
                        data:"", isCompleted: false
                    }
                }
            })
        },
        fetchGenerator: async () => {
            try {
                const data = await generateCsvAPI({maxSpend: "1000", size: 0.001, withErrors: "off"})
                set(() => {
                    return {
                        file: {
                            data, isCompleted: true
                        }
                    }
                })
            } catch (error) {
                throw new Error("Error while fetching file data.");
            }
        }
    }

})