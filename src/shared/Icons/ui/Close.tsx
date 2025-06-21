type PropsType = {
    width?: string;
    height?: string;
}
const Close = (props: PropsType) => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={props.width || "32.000000"}
             height={props.height || "32.000000"} viewBox={`0 0 32 32`} fill="none">
            <defs>
                <clipPath id="clip12_521">
                    <rect id="proicons:cancel" rx="0.000000" width="30.666666" height="30.666666"
                          transform="translate(0.666667 0.666667)" fill="white" fillOpacity="0"/>
                </clipPath>
            </defs>
            <rect id="proicons:cancel" rx="0.000000" width="30.666666" height="30.666666"
                  transform="translate(0.666667 0.666667)" fill="#FFFFFF" fillOpacity="0"/>
            <g clipPath="url(#clip12_521)">
                <path id="Vector" d="M6.66 25.33L16 16L25.33 6.66M16 16L6.66 6.66M16 16L25.33 25.33" stroke="#FFFFFF"
                      strokeOpacity="1.000000" strokeWidth="2.000000" strokeLinejoin="round" strokeLinecap="round"/>
            </g>
        </svg>
    );
};

export default Close;