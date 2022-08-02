import React, { useEffect, useRef, useState } from 'react';
import styles from '@styles/Registers.module.css';
import { useSelector } from 'react-redux';
import PopUp from './popUp';
import ScrollContent from './scrollContent';
import { bigIntToHexString, formatBinary } from '@util/formatUtils';

export default function Registers(props) {
    const values = useSelector((state) => state.registers);
    const cpsr = useSelector((state) => state.cpsr);
    const lastUpdate = useSelector((state) => state.lastRegister);
    const [popupState, setPopupState] = useState({ title: '', value: 0n, display: false, rect: {}, last: '' });
    const [height, setHeight] = useState(0);
    const [scroll, setScroll] = useState(0);
    const regRef = useRef(null);
    const updateRef = useRef(null);

    useEffect(() => {
        const element = (lastUpdate === 0 ? regRef : updateRef).current;
        if (element)
            setScroll(element.offsetTop);
    }, [lastUpdate]);

    useEffect(() => {
        setHeight(regRef.current.clientHeight);
    }, [regRef?.current?.clientHeight]);

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
            <tr key={`register${i}`} ref={i === 0 ? regRef : (i === lastUpdate ? updateRef : undefined)} className={lastUpdate === i ? styles.highlight : ''}>
                <td className={styles.name}>{registerLabels[i]}</td>
                <td className={styles.value} onMouseOver={hover(registerLabels[i],  values[i])} onMouseLeave={leave(registerLabels[i])}>
                    {bigIntToHexString(values[i] < 0 ? (1n << 64n) + values[i] : values[i], 64)}
                </td>
            </tr>
        );
    }
    regs.push(
        <tr key={'cpsr'}>
            <td className={styles.name}>CPSR</td>
            <td className={styles.value} onMouseOver={hover('CPSR',  `Z: ${cpsr >> 30n & 1n}`)} onMouseLeave={leave('CPSR')}>
                {formatBinary(cpsr >> 28n, 4)}...
            </td>
        </tr>
    );

    return (
        <>
            <PopUp title={popupState.title} display={popupState.display} rect={popupState.rect}>
                {popupState.value.toString()}
            </PopUp>
            <ScrollContent height={`${height * 8}px`} scrollTop={scroll}>
                <table>
                    <tbody>
                        {regs}
                    </tbody>
                </table>
            </ScrollContent>
        </>
    );
}
