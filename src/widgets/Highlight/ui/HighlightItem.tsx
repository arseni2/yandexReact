import styles from "../css/Hightlight.module.css"
import Typography from "../../../shared/Typography/ui/Typography.tsx";

type PropsType = {
    title: string
    description: string
    bg?: string
}
const HighlightItem = ({bg, description, title}: PropsType) => {
    return (
        <div style={{background: bg ? `${bg}` : "white"}} className={styles.container}>
            <Typography bold size={40}>{title}</Typography>
            <Typography size={20}>{description}</Typography>
        </div>
    );
};

export default HighlightItem;