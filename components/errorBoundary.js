import styles from "@styles/ErrorBoundary.module.css";

export default function ErrorBoundary({
    error,
    title,
    restart,
    inspect,
    children,
}) {
    if (!error) return children;

    return (
        <>
            <div className={styles.overlay}>
                <div className={styles.modal}>
                    <h2 className={styles.title}>{title}</h2>
                    <div className={styles.body}>
                        <pre>{error.toString()}</pre>
                        <button className={styles.button} onClick={restart}>
                            Restart
                        </button>
                        <button className={styles.button} onClick={inspect}>
                            Inspect
                        </button>
                    </div>
                </div>
            </div>
            {children}
        </>
    );
}
