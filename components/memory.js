import React, { useState } from 'react';
import ScrollContent from "@components/scrollContent";
import { MAX_ADDRESS } from "@util/memoryUtils";
import { bigIntArrayToBigInt, bigIntToHexString, formatBinary } from '@util/formatUtils';
import styles from '@styles/Memory.module.css';
import PopUp from './popUp';
import { useSelector } from 'react-redux';

/**
 * React Component representing a virtual memory space for a process.
 */
function Memory(props) {
    const programSize = useSelector((state) => state.programSize);
    const bssStartAddress = useSelector((state) => state.bssStartAddress);
    const bssEndAddress = useSelector((state) => state.bssEndAddress);
    const stackData = useSelector((state) => state.stackData);
    const textData = useSelector((state) => state.textData);
    const frames = useSelector((state) => state.frames);
    const stackPointer = useSelector((state) => state.registers)[28];

    const [popupState, setPopupState] = useState({ title: '', display: false, rect: {}, children: [], last: '' });

    let popUpID = 0;
    const hover = (title, children) => {
        const id = ++popUpID;
        return (event) => {
            setPopupState({
                title: title,
                display: true,
                rect: event.target.getBoundingClientRect(),
                children: children,
                last: id
            });
        };
    };

    const leave = () => {
        const id = popUpID;
        return (event) => {
            if (id === popupState.last)
                setPopupState({ ...popupState, display: false });
        };
    };

    // Count hex digits in max address
    let digits = 0;
    while ((BigInt(MAX_ADDRESS) >> BigInt(digits * 4)) > 0)
        digits++;

    const stack = [];
    const lastFrame = frames[frames.length - 1];
    const renderFrames = [...frames, stackPointer - 1n]
    for (let i = 0; i < stackData.length; i += 8) {
        const dwordBytes = [];
        for (let j = i, k = false; j < i + 8; j++) {
            const address = MAX_ADDRESS - j;
            const addressText = address.toString(16).padStart(digits, '0').toUpperCase();
            const value = j < stackData.length ? stackData[j] : 0n;

            let additionalStyles = '';
            if (renderFrames.includes(BigInt(address))) {
                if (lastFrame >= address)
                    additionalStyles = styles['frame-start-primary'];
                else
                    additionalStyles = styles['frame-start'];
                k = true;
            } else if(k) {
                if (lastFrame > address)
                    additionalStyles = styles['frame-boundary-primary'];
                else
                    additionalStyles = styles['frame-boundary'];
            }
            
            if (stackPointer > address) {
                additionalStyles += ` ${styles['unscoped']}`;
            } else if (lastFrame >= address) {
                additionalStyles += ` ${styles['frame-data-primary']}`;
            } else {
                additionalStyles += ` ${styles['frame-data']}`;
            }

            if (stackPointer == address)
                additionalStyles += ` ${styles.sp}`;

            dwordBytes.unshift(
                <td key={j} className={`${styles.value} ${additionalStyles}`} onMouseOver={hover(addressText, <>
                        Decimal: {value.toString()}
                            <br />
                        Binary: {formatBinary(value, 8)}
                    </>)} onMouseLeave={leave()}>
                    {bigIntToHexString(value, 8)}
                </td>
            );
        }
        const address = MAX_ADDRESS - (i + 7);
        const addressText = address.toString(16).padStart(digits, '0').toUpperCase();
        stack.push(
            <tr key={`block${i}`} className={styles.block}>
                <td className={`${styles.addr} ${(stackPointer >= address && stackPointer < address + 8) ? styles.sp : ''}`}
                    onMouseOver={hover(addressText, <>Value: {bigIntArrayToBigInt(stackData.slice(i, i + 8).reverse(), 8n).toString()}</>)}
                    onMouseLeave={leave()}>
                    {addressText}
                </td>
                {dwordBytes}
            </tr>
        );
    }

    const text = [];
    for (let i = 0; i < textData.length; i += 8) {
        const dwordBytes = [];
        for (let j = i; j < i + 8; j++) {
            const addressText = (j).toString(16).padStart(digits, '0').toUpperCase();
            const value = j < textData.length ? textData[j] : 0n;
            dwordBytes.push(
                <td key={j} className={styles.value}
                    onMouseOver={hover(addressText, <>
                        Decimal: {value.toString()}
                        <br />
                        Binary: {formatBinary(value, 8)}
                    </>)} onMouseLeave={leave()}>
                    {bigIntToHexString(value, 8)}
                </td>
            );
        }
        const addressText = (i).toString(16).padStart(digits, '0');
        text.unshift(
            <tr key={`block${i}`} className={styles.block}>
                <td className={styles.addr}
                    onMouseOver={hover(addressText, <>Value: {bigIntArrayToBigInt(textData.slice(i, i + 8), 8n).toString()}</>)}
                    onMouseLeave={leave()}>
                    {addressText}
                </td>
                {dwordBytes}
            </tr>
        );
    }


    return (
        <>
            <PopUp title={popupState.title} display={popupState.display} rect={popupState.rect}>
                {popupState.children}
            </PopUp>
            <ScrollContent>
                <table className={styles.memory}>
                    <thead>
                    <tr>
                        <th className={styles.header}>Address</th>
                        <th className={styles.header} colSpan={8}>Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stack}
                    <tr className={styles.spacer}>
                        <td>⋮</td>
                        <td colSpan={8}>⋮</td>
                    </tr>
                    {text}
                    </tbody>
                </table>
            </ScrollContent>
        </>
    );
}

export default Memory;