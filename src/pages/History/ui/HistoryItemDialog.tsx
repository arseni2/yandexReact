import Dialog from "../../../widgets/Dialog/ui/Dialog.tsx";
import type {HistoryItemType} from "../../../store/slices/history.ts";
import HighlightItem from "../../../widgets/Highlight/ui/HighlightItem.tsx";
import {getDateFromDay} from "../../CsvAnalytics/ui/HighlightContainer.tsx";

type PropsType = {
    open: boolean;
    setOpen: (value: boolean) => void;
    history: HistoryItemType
}
const HistoryItemDialog = ({open, setOpen, history}: PropsType) => {
    return (
        <Dialog setIsOpen={setOpen} isOpen={open}>
            <div style={{display: "flex", flexDirection: "column", gap: "13px"}}>
                <HighlightItem bg={"#EACDFF"} title={`${history?.data?.total_spend_galactic}`}
                               description={"общие расходы в галактических кредитах"}/>
                <HighlightItem bg={"#EACDFF"} title={`${history?.data?.rows_affected}`}
                               description={"количество обработанных записей"}/>
                <HighlightItem bg={"#EACDFF"} title={getDateFromDay(history?.data?.less_spent_at || 0)}
                               description={"день года с минимальными расходами"}/>
                <HighlightItem bg={"#EACDFF"} title={`${history?.data?.big_spent_civ}`}
                               description={"цивилизация с максимальными расходами"}/>
                <HighlightItem bg={"#EACDFF"} title={`${history?.data?.less_spent_civ}`}
                               description={"цивилизация с минимальными расходами"}/>
                <HighlightItem bg={"#EACDFF"} title={getDateFromDay(history?.data?.big_spent_at || 0)}
                               description={"день года с максимальными расходами"}/>
            </div>
        </Dialog>
    );
};

export default HistoryItemDialog;