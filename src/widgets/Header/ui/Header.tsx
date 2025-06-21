import styles from "../css/Header.module.css"
import Logo from "../../../shared/Icons/ui/Logo.tsx";
import {NavLink} from "react-router";
import MageUpload from "../../../shared/Icons/ui/MageUpload.tsx";
import Typography from "../../../shared/Typography/ui/Typography.tsx";
import CsvGenerator from "../../../shared/Icons/ui/CSVGenerator.tsx";
import History from "../../../shared/Icons/ui/History.tsx";

const Header = () => {
    return (
        <div className={styles.header}>
            <div>
                <Logo />
            </div>

            <div className={styles.linkContainer}>
                <NavLink className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                } to={"/"}>
                    <MageUpload />
                    <Typography size={30}>CSV Аналитик</Typography>
                </NavLink>

                <NavLink className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                } to={"/generator"}>
                    <CsvGenerator />
                    <Typography size={30}>CSV Генератор</Typography>
                </NavLink>

                <NavLink className={({ isActive }) =>
                    isActive ? `${styles.link} ${styles.active}` : styles.link
                } to={"/history"}>
                    <History />
                    <Typography size={30}>История</Typography>
                </NavLink>
            </div>
        </div>
    );
};

export default Header;