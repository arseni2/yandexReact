import Dialog from "../../../widgets/Dialog/ui/Dialog.tsx";
import type {HistoryItemType} from "../../../store/slices/history.ts";
import HighlightItem from "../../../widgets/Highlight/ui/HighlightItem.tsx";

type PropsType = {
    open: boolean;
    setOpen: (value: boolean) => void;
    history: HistoryItemType
}
const HistoryItemDialog = ({ open, setOpen, history }: PropsType) => {
    return (
        <Dialog setIsOpen={setOpen} isOpen={open}>
            {history.data
                ? <div style={{display: "flex", flexDirection: "column", gap: "13px"}}>
                    <HighlightItem bg={"#EACDFF"} title={`${history.data.total_spend_galactic}`} description={"общие расходы в галактических кредитах"} />
                    <HighlightItem bg={"#EACDFF"} title={`${history.data.rows_affected}`} description={"количество обработанных записей"} />
                    <HighlightItem bg={"#EACDFF"} title={`${history.data.less_spent_at}`} description={"день года с минимальными расходами"} />
                    <HighlightItem bg={"#EACDFF"} title={`${history.data.big_spent_civ}`} description={"цивилизация с максимальными расходами"} />
                    <HighlightItem bg={"#EACDFF"} title={`${history.data.less_spent_civ}`} description={"цивилизация с минимальными расходами"} />
                    <HighlightItem bg={"#EACDFF"} title={`${history.data.big_spent_at}`} description={"день года с максимальными расходами"} />
                </div>
                : <div>

                </div>
            }

        </Dialog>
    );
};

export default HistoryItemDialog;