import classNames from "classnames";
import styles from "../css/button.module.css"

type PropsType = {
    text: string;
    green?: boolean;
    black?: boolean;
    yellow?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>
const Button = (props: PropsType) => {
    return (
        <button className={classNames([{
            [styles.base]: true,
            [styles.green]: props.green,
            [styles.black]: props.black,
            [styles.yellow]: props.yellow,
        }])} {...props}>

            {props.text}

        </button>
    );
};

export default Button;