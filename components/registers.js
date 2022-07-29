import React, { useState } from 'react';
import Register from '@components/register';
import styles from '@styles/Registers.module.css';
import { useSelector } from 'react-redux';
import PopUp from './popUp';

export default function Registers(props) {
    const values = useSelector((state) => state.registers);
    const lastUpdate = useSelector((state) => state.lastRegister);
    const [popupState, setPopupState] = useState({ title: '', value: 0n, display: false, rect: {}, last: '' });

    const hover = (name, value) => (event) => {
        setPopupState({
            title: name,
            value: value,
            display: true,
            rect: event.target.getBoundingClientRect(),
            last: name
        });
    };

    const leave = (name) => (event) => {
        if (name === popupState.last)
            setPopupState({ ...popupState, display: false });
    };

    const registerLabels = ['SP', 'FP', 'LR', 'XZR'];
    for (let i = 27; i >= 0; i--)
        registerLabels.unshift(`X${i}`);

    const col1 = [], col2 = [];
    for (let i = 0; i < 16; i++) {
        col1.push(<Register key={`register${i}`} registerName={registerLabels[i]} value={values[i]} highlight={lastUpdate === i}
                    onMouseOver={hover(registerLabels[i],  values[i])} onMouseLeave={leave(registerLabels[i])} />);
        col2.push(<Register key={`register${i + 16}`} registerName={registerLabels[i + 16]} value={values[i + 16]} highlight={lastUpdate === i + 16}
                    onMouseOver={hover(registerLabels[i + 16],  values[i + 16])} onMouseLeave={leave(registerLabels[i + 16])} />);
    }

    return (
        <>
            <PopUp title={popupState.title} display={popupState.display} rect={popupState.rect}>
                {popupState.value.toString()}
            </PopUp>
            <div className={styles.row}>
                <div className={styles.column}>
                    {col1}
                </div>
                <div className={styles.column}>
                    {col2}
                </div>
            </div>
        </>
    );
}
