import HistoryItem from "../../../widgets/HistoryItem/ui/HistoryItem.tsx";
import Button from "../../../shared/Button/ui/Button.tsx";
import styles from "../css/History.module.css"
import {NavLink} from "react-router";
import {useHistoryStore} from "../../../store/slices/history.ts";

const History = () => {
    const historyStore = useHistoryStore()
    // const [open, setOpen] = useState<Record<string, boolean>>({});

    const handleClickDelete = (id: number) => {
        historyStore.removeHistoryItem(id)
    }
    const handleClickClear = () => {
        historyStore.clearHistory()
    }
    // const handleClickOpenModal = (historyId: number) => {
    //     setOpen((prevState) => {
    //         return {...prevState, [historyId]: true}
    //     })
    // }
    // const handleClickCloseModal = (historyId: number) => {
    //     setOpen((prevState) => {
    //         return {...prevState, [historyId]: false}
    //     })
    // }
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