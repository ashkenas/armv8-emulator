import styles from '@styles/PopUp.module.css';

export default function PopUp(props) {
    return (
        <div className={`${styles.popup} ${props.flipY ? styles.flipY : ''} ${props.flipX ? styles.flipX : ''}`}>
            <h3 className={styles.title}>{props.title}</h3>
            <div className={styles.body}>
                {props.children}
            </div>
        </div>
    );
};