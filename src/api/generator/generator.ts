import {BASE_URL} from "../index.ts";

export type GenerateCsvPayloadType = {
    size: number
    withErrors: "on" | "off"
    maxSpend: string
}
export const generateCsvAPI = async (payload: GenerateCsvPayloadType) => {
    const response = await fetch(`${BASE_URL}/report?size=${payload.size}&withErrors=${payload.withErrors}&maxSpend=${payload.maxSpend}`)
    if(!response.ok) throw new Error("Failed to generate Csv")
    return await response.text()
}