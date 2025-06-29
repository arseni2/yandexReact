import HistoryItem from "../../../widgets/HistoryItem/ui/HistoryItem.tsx";
import Button from "../../../shared/Button/ui/Button.tsx";
import styles from "../css/History.module.css"
import {NavLink} from "react-router-dom";
import {useHistoryStore} from "../../../store/slices/history/history.ts";

const History = () => {
    const historyStore = useHistoryStore()

    const handleClickDelete = (id: number) => {
        historyStore.removeHistoryItem(id)
    }
    const handleClickClear = () => {
        historyStore.clearHistory()
    }


    return (
        <div>
            <div className={styles.container_history}>
                {historyStore.items.length > 0 && historyStore.items.map((history) => (
                    <HistoryItem handleClickDelete={handleClickDelete} key={history.id} history={history} />
                ))}
            </div>

            <div className={styles.button_container}>
                <NavLink to={"/generator"}>
                    <Button green text={"Сгенерировать больше"}/>
                </NavLink>
                <Button onClick={handleClickClear} black text={"Очистить всё"}/>
            </div>

        </div>
    );
};

export default History;