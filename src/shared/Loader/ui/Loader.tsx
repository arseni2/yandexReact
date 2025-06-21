import styles from "../css/Loader.module.css"

type PropsType = {
    size?: number; // Размер лоадера (по умолчанию 100px)
    strokeWidth?: number; // Толщина обводки (по умолчанию 8px)
}
const Loader = ({strokeWidth = 6, size = 50}: PropsType) => {
    const cx = size / 2;
    const cy = size / 2;
    const r = (size - strokeWidth) / 2;
    return (
        <div className={styles.loaderContainer} style={{width: size, height: size}}>
            <svg
                className={styles.loader}
                viewBox={`0 0 ${size} ${size}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Белый фоновый круг */}
                <circle
                    cx={cx}
                    cy={cy}
                    r={r}
                    fill="transparent"
                    stroke="#fff"
                    strokeWidth={strokeWidth}
                />

                {/* Группа с зеленым сегментом */}
                <g className={styles.rotatingSegment}>
                    <circle
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="transparent"
                        stroke="#4caf50"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray="20 1000"
                        transform={`rotate(-90, ${cx}, ${cy})`}
                    />
                </g>
            </svg>
        </div>
    );
};

export default Loader;