import {useEffect, useState} from 'react';
import Typography from "../../../shared/Typography/ui/Typography.tsx";
import Button from "../../../shared/Button/ui/Button.tsx";
import styles from "../css/CsvGenerator.module.css"
import ButtonUpload, {ButtonStatus} from "../../../shared/Button/ui/ButtonUpload.tsx";
import {useGeneratorStore} from "../../../store/slices/generator.ts";


const CsvGenerator = () => {
    const store = useGeneratorStore();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = () => {
        setError(null);
        setLoading(true);

        store.fetchGenerator()
            //мб стоит в аналитику вынести
            .then(() => {

            })
            .catch((err) => {
                setError('Ошибка при генерации файла');
                console.error(err);

            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleClose = () => {
        store.clearFile();
        setError(null);
    };

    const downloadFile = () => {
        const blob = new Blob([store.file.data], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);
        const linkRef = document.createElement('a');
        linkRef.href = url;
        linkRef.download = 'file.csv';
        linkRef.click();
        URL.revokeObjectURL(url);
    };
    useEffect(() => {
        if (store.file.data) {
            downloadFile()
        }
    }, [store.file.data])
    return (
        <div>
            <Typography size={30} center>
                Сгенерируйте готовый csv-файл нажатием одной кнопки
            </Typography>


            <div className={styles.container_center}>
                {error ? (
                        <ButtonUpload handleCloseIcon={handleClose} buttonTitle={"Ошибка"} buttonDescription={"упс, не то..."} status={ButtonStatus.Error}/>
                    )
                    : store.file.data ? (
                        <ButtonUpload
                            handleCloseIcon={handleClose}
                            buttonTitle={"Done!"}
                            buttonDescription={"файл сгенерирован!"}
                            status={ButtonStatus.Done}
                        />
                    ) : loading ? (
                        <ButtonUpload
                            onClick={handleClick}
                            buttonTitle={""}
                            buttonDescription={""}
                            status={ButtonStatus.Loading}
                        />
                    ) : (
                        <Button onClick={handleClick} green text={"Начать генерацию"}/>
                    )
                }
            </div>
        </div>
    );
};

export default CsvGenerator;