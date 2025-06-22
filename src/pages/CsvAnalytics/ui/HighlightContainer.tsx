import type {AggregatedData} from "../../../api/analitycs.ts";
import HighlightItem from "../../../widgets/Highlight/ui/HighlightItem.tsx";
import styles from "../css/CsvAnalytics.module.css"

type PropsType = {
    data: AggregatedData
}

export function getDateFromDay(dayOfYear: number): string {
    const months = [
        { name: "января", days: 31 },
        { name: "февраля", days: 28 },
        { name: "марта", days: 31 },
        { name: "апреля", days: 30 },
        { name: "мая", days: 31 },
        { name: "июня", days: 30 },
        { name: "июля", days: 31 },
        { name: "августа", days: 31 },
        { name: "сентября", days: 30 },
        { name: "октября", days: 31 },
        { name: "ноября", days: 30 },
        { name: "декабря", days: 31 }
    ];

    let remainingDays = dayOfYear;
    let monthIndex = 0;

    for (let i = 0; i < months.length; i++) {
        if (remainingDays <= months[i].days) {
            monthIndex = i;
            break;
        } else {
            remainingDays -= months[i].days;
        }
    }

    const day = remainingDays;
    const monthName = months[monthIndex].name;

    return `${day} ${monthName}`;
}

const HighlightContainer = ({data}: PropsType) => {
    return (
        <div className={styles.containerHighlights}>
            <div className={styles.containerFlex}>
                <HighlightItem title={`${data.total_spend_galactic}`} description={"общие расходы в галактических кредитах"}/>
                <HighlightItem title={`${data.rows_affected}`} description={"количество обработанных записей"}/>
                <HighlightItem title={getDateFromDay(data.less_spent_at)} description={"день года с минимальными расходами  "}/>
                <HighlightItem title={`${data.big_spent_civ}`} description={"цивилизация с максимальными расходами   "}/>
            </div>

            <div className={styles.containerFlex}>
                <HighlightItem title={`${data.less_spent_civ}`} description={"цивилизация с минимальными расходами"}/>
                <HighlightItem title={getDateFromDay(data.big_spent_at)} description={"день года с максимальными расходами  "}/>
                <HighlightItem title={`${data.big_spent_value}`} description={"максимальная сумма расходов за день "}/>
                <HighlightItem title={`${data.average_spend_galactic}`} description={" средние расходы в галактических кредитах"}/>
            </div>
        </div>
    );
};

export default HighlightContainer;