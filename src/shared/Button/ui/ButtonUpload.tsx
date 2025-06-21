import styles from "../css/button.module.css"
import classNames from "classnames";
import Close from "../../Icons/ui/Close.tsx";
import Typography from "../../Typography/ui/Typography.tsx";
import Loader from "../../Loader/ui/Loader.tsx";

export const ButtonStatus = {
    Default: 'default',
    White: 'white',
    Upload: 'upload',
    Loading: 'loading',
    Done: 'done',
    Error: 'error',
} as const;

type ButtonStatusType = typeof ButtonStatus[keyof typeof ButtonStatus];

type PropsType = {
    buttonTitle?: string,
    buttonDescription?: string,

    status?: ButtonStatusType;

    handleCloseIcon?: () => void
} & React.ButtonHTMLAttributes<HTMLButtonElement>
const ButtonUpload = (props: PropsType) => {
    const {status = ButtonStatus.Default} = props;
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <div style={{display: 'flex', alignItems: "center", gap: "10px", width: "100%", justifyContent: "center", marginBottom: "10px"}}>
                <button
                    className={classNames({
                        [styles.base]: true,
                        [styles.white]: status === ButtonStatus.White,
                        [styles.upload]: status === ButtonStatus.Upload,
                        [styles.loading]: status === ButtonStatus.Loading,
                        [styles.done]: status === ButtonStatus.Done,
                        [styles.error]: status === ButtonStatus.Error,
                    })}
                    {...props}
                >
                    {status === ButtonStatus.Loading
                        ? <Loader/>
                        : <Typography size={35}>
                            {props.buttonTitle}
                        </Typography>
                    }
                </button>

                {(status === ButtonStatus.Upload || status === ButtonStatus.Done || status === ButtonStatus.Error) && (
                    <div className={styles.iconButton} onClick={props.handleCloseIcon}>
                        <Close/>
                    </div>
                )}
            </div>
            {status === ButtonStatus.Error
                ? <Typography extraClassname={styles.textError} size={35}>{props.buttonDescription}</Typography>
                : <Typography size={35}>{props.buttonDescription}</Typography>
            }
        </div>
    );
};

export default ButtonUpload;