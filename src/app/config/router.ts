import {createBrowserRouter} from "react-router";
import Main from "../../pages/Main/ui/Main.tsx";
import CsvAnalytics from "../../pages/CsvAnalytics/ui/CsvAnalytics.tsx";
import CsvGenerator from "../../pages/CsvGenerator/ui/CsvGenerator.tsx";
import History from "../../pages/History/ui/History.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Main,
        children: [
            {
                path: "",
                Component: CsvAnalytics
            },
            {
                path: "generator",
                Component: CsvGenerator
            },
            {
                path: "history",
                Component: History
            },
        ]
    }
])