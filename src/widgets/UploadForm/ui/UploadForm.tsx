import {type ChangeEvent, useEffect, useRef, useState} from 'react';
import Typography from '../../../shared/Typography/ui/Typography.tsx';
import styles from '../css/UploadForm.module.css';
import Button from "../../../shared/Button/ui/Button.tsx";
import ButtonUpload, {ButtonStatus} from "../../../shared/Button/ui/ButtonUpload.tsx";
import classNames from "classnames";
import {useAnalyticStore} from "../../../store/slices/analytic/analytic.ts";
import {useHistoryStore} from "../../../store/slices/history/history.ts";
import {formatDate} from "../../../pages/CsvGenerator/utils/formatDate.ts";
import HighlightContainer from "../../../pages/CsvAnalytics/ui/HighlightContainer.tsx";
import {useLocation} from "react-router-dom";

const UploadForm = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const location = useLocation();

    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [disabled, setDisabled] = useState<boolean>(true);
    const [fetching, setFetching] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);

    const analyticStore = useAnalyticStore()
    const historyStore = useHistoryStore();

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };
    const handleIconClose = () => {
        setDisabled(true)
        setFetching(false)
        setFile(null)
        setError(null)
    }
    const handleClickResetAll = () => {
        handleIconClose()
        analyticStore.resetStore()
    }
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragEnter = () => {
        setIsDragging(true);
    };
    const handleDragLeave = () => {
        setIsDragging(false);
    };
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            if(files[0].type !== "text/csv" || files[0].size === 0) {
                setError("file not supported")
            } else {
                setDisabled(false);
                setFile(files[0]);
            }
        }
    };
    const handleInputFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        console.log(files)
        if (files && files.length > 0) {
            setDisabled(false);
            setFile(files[0]);
        }
    }

    const uploadFile = () => {
        if (file) {
            setFetching(true)
            analyticStore.sendFile({file})
                .catch(() => {
                    setError("file error")
                    historyStore.addHistoryItem({
                        filename: file.name,
                        id: Date.now(),
                        date: formatDate(new Date()),
                        isCompleted: false,
                    });
                })
        }
    }

    const isDoneFile = !error && !analyticStore.isLoading && analyticStore.response.total_spend_galactic > 0
    useEffect(() => {
        if (isDoneFile && !analyticStore.isLoading) {
            historyStore.addHistoryItem({
                filename: file?.name || "",
                id: Date.now(),
                date: formatDate(new Date()),
                isCompleted: true,
                data: analyticStore.response
            });
        }
    }, [isDoneFile, analyticStore.isLoading])

    useEffect(() => {
        handleClickResetAll()
    }, [location.pathname])

    return (
        <div>
            <Typography extraClassname={styles.uploadFormTitle} size={30}>
                Загрузите <Typography bold>csv</Typography> файл и получите{' '}
                <Typography bold>полную информацию</Typography> о нём за сверхнизкое время
            </Typography>

            <div
                className={classNames(styles.dropzone, {
                    [styles.dragging]: isDragging,
                    [styles.draggingSuccess]: !!file,
                    [styles.draggingError]: !!error,
                })}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    onChange={handleInputFileChange}
                    id="inputFile"
                    type="file"
                    accept="text/csv"
                    data-testid="inputFile"
                    hidden
                    ref={fileInputRef}
                />

                {isDoneFile
                    ? <ButtonUpload handleCloseIcon={handleClickResetAll} data-testid={"button-done-file"} buttonDescription={"готово!"}
                                    buttonTitle={file?.name} status={ButtonStatus.Done}/>
                    : analyticStore.isLoading
                        ? <ButtonUpload
                            buttonDescription={"идёт парсинг файла"}
                            status={ButtonStatus.Loading}
                            onClick={handleButtonClick}
                        />
                        : error
                            ? <ButtonUpload data-testid="upload-file-btn-error" buttonDescription={"упс, не то..."} buttonTitle={"Ошибка"} status={ButtonStatus.Error} handleCloseIcon={handleIconClose} />
                            : <ButtonUpload
                                data-testid="upload-file-btn"
                                handleCloseIcon={handleIconClose}
                                status={!file ? ButtonStatus.White : ButtonStatus.Upload}
                                buttonTitle={!file ? "Загрузить файл" : file.name}
                                buttonDescription={!file ? "или перетащите сюда" : "файл загружен!"}
                                onClick={handleButtonClick}
                            />
                }

            </div>

            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                {isDoneFile
                    ? null
                    : !error && !analyticStore.isLoading &&
                    <Button onClick={uploadFile} green={!disabled} disabled={disabled} text={"Отправить"} data-testid={"send-btn"}/>
                }
            </div>

            {analyticStore.response.rows_affected > 0 && fetching && !error
                ? <HighlightContainer data={analyticStore.response} />
                : <div className={styles.highlightContainer}>
                    <Typography center size={40} extraClassname={styles.colorText}>
                        Здесь <br/> появятся хайлайты
                    </Typography>
                </div>
            }
        </div>
    );
};

export default UploadForm;