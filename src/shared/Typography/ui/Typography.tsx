import {type ReactNode} from 'react';
import styles from "../css/Typography.module.css"
import classNames from 'classnames';

type PropsType = {
    children: ReactNode
    bold?: boolean
    center?: boolean
    alignCenter?: boolean
    disabled?: boolean
    extraClassname?: string
    size?: number
}
const Typography = (props: PropsType) => {
    return (
        <p style={{fontSize: `${props.size}px`}}
            className={classNames({
            [styles.base]: true,
            [styles.alignCenter]: props.alignCenter,
            [styles.disabled]: props.disabled,
            [styles.bold]: props.bold,
            [styles.center]: props.center,
            [props.extraClassname as string]: true
        })}>
            {props.children}
        </p>
    );
};

export default Typography;