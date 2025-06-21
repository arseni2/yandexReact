import {type ReactNode} from 'react';
import styles from "../css/Dialog.module.css"
import {createPortal} from "react-dom";
import Close from "../../../shared/Icons/ui/Close.tsx";

type PropsType = {
    isOpen: boolean,
    setIsOpen: (value: boolean) => void,
    children: ReactNode
}

const Dialog = ({ isOpen, setIsOpen, children }: PropsType) => {
    if (!isOpen) return null;

    const handleClose = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsOpen(false);
    };

    const handleDialogClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return createPortal(
        <div className={styles.overlay} onClick={handleClose}>
            <button className={styles.closeBtn} onClick={handleClose}>
                <div className={styles.closeBtnItem}>
                    <Close height={"28"} width={"28"} />
                </div>
            </button>
            <div className={styles.modal} onClick={handleDialogClick}>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>,
        document.getElementById('root') as HTMLElement
    );
};

export default Dialog;