import React from 'react';
import Register from '@components/register';
import styles from '@styles/Registers.module.css';
import { useSelector } from 'react-redux';

export default function Registers(props) {
    const values = useSelector((state) => state.registers);
    const registerLabels = ['SP', 'FP', 'LR', 'XZR'];
    for (let i = 27; i >= 0; i--)
        registerLabels.unshift(`X${i}`);

    const col1 = [], col2 = [];
    for (let i = 0; i < 16; i++) {
        col1.push(<Register key={`register${i}`} registerName={registerLabels[i]} value={values[i]} />);
        col2.push(<Register key={`register${i + 16}`} registerName={registerLabels[i + 16]} value={values[i + 16]} />);
        // col1.push(<Register key={`register${i}`} registerName={registerLabels[i]} value={props.values[i]} />);
        // col2.push(<Register key={`register${i + 16}`} registerName={registerLabels[i + 16]} value={props.values[i + 16]} />);
    }

    return (
        <div className={styles.row}>
            <div className={styles.column}>
                {col1}
            </div>
            <div className={styles.column}>
                {col2}
            </div>
        </div>
    );
}
