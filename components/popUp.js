import styles from '@styles/PopUp.module.css';

export default function PopUp({ title, display, rect, children }) {
    if (!display)
        return <></>;

    return (
        <div className={`${styles.popup}`} style={{bottom: window.innerHeight - rect.top, left: rect.left}}>
            {title && <h3 className={styles.title}>{title}</h3>}
            <div className={styles.body}>
                {children}
            </div>
        </div>
    );
};