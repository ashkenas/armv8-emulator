import React, { useEffect, useRef, useState } from 'react';
import styles from '@styles/Registers.module.css';
import { useSelector } from 'react-redux';
import PopUp from './popUp';
import ScrollContent from './scrollContent';
import { bigIntToHexString } from '@util/formatUtils';

export default function Registers(props) {
    const values = useSelector((state) => state.registers);
    const lastUpdate = useSelector((state) => state.lastRegister);
    const [popupState, setPopupState] = useState({ title: '', value: 0n, display: false, rect: {}, last: '' });
    const [height, setHeight] = useState(0);
    const regRef = useRef(null);

    useEffect(() => {
        setHeight(regRef.current.clientHeight);
    }, []);

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

    const regs = [];
    for (let i = 0; i < 32; i++) {
        regs.push(
            <tr key={`register${i}`} ref={i === 0 ? regRef : undefined} className={lastUpdate === i ? styles.highlight : ''}>
                <td className={styles.name}>{registerLabels[i]}</td>
                <td className={styles.value} onMouseOver={hover(registerLabels[i],  values[i])} onMouseLeave={leave(registerLabels[i])}>
                    {bigIntToHexString(values[i] < 0 ? (1n << 64n) + values[i] : values[i], 64)}
                </td>
            </tr>
        );
    }

    return (
        <>
            <PopUp title={popupState.title} display={popupState.display} rect={popupState.rect}>
                {popupState.value.toString()}
            </PopUp>
            <ScrollContent height={`${height * 8}px`}>
                <table>
                    <tbody>
                        {regs}
                    </tbody>
                </table>
            </ScrollContent>
        </>
    );
}
