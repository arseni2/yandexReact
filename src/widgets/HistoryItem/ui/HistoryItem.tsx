import {useState} from 'react';
import Document from "../../../shared/Icons/ui/Document.tsx";
import Typography from "../../../shared/Typography/ui/Typography.tsx";
import Smile from "../../../shared/Icons/ui/Smile.tsx";
import SadSmile from "../../../shared/Icons/ui/SadSmile.tsx";
import Trash from "../../../shared/Icons/ui/Trash.tsx";
import styles from "../css/HistoryItem.module.css"
import type {HistoryItemType} from "../../../store/slices/history/history.ts";
import HistoryItemDialog from "../../../pages/History/ui/HistoryItemDialog.tsx";

type PropsType = {
    history: HistoryItemType
    handleClickDelete: (id: number) => void;
}
const HistoryItem = ({ history, handleClickDelete }: PropsType) => {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        if(history.isCompleted) {
            setOpen(true)
        }
    }
    return (
        <>
            <div style={{cursor: history.isCompleted ? "pointer" : "default"}} className={styles.container} onClick={handleClickOpen} data-testid={`history-item`}>
                <div className={styles.item}>
                    <div className={styles.flex}>
                        <Document/>
                        <Typography>{history.filename}</Typography>
                    </div>
                    <Typography>{history.date}</Typography>
                    <Typography alignCenter disabled={!history.isCompleted}>Обработан успешно <Smile/></Typography>
                    <Typography alignCenter disabled={history.isCompleted}>Не удалось обработать <SadSmile/></Typography>
                </div>

                <div onClick={() => handleClickDelete(history.id)} className={styles.deleteBtn} data-testid={"delete-btn"}>
                    <Trash/>
                </div>
            </div>
            <HistoryItemDialog history={history} setOpen={setOpen} open={open} data-testid={`history-item-dialog`} />
        </>
    );
};

export default HistoryItem;