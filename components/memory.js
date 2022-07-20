import React from 'react';
import ScrollContent from "@components/scrollContent";
import MemoryStructure from "@util/memoryStructure";
import { bigIntArrayToBigInt, bigIntToHexString, formatBinary } from '@util/formatUtils';
import styles from '@styles/Memory.module.css';
import PopUp from './popUp';

/**
 * React Component representing a virtual memory space for a process.
 */
function Memory(props) {
    if (props.memory.stack === null)
        return <></>;

    // Count hex digits in max address
    let digits = 0;
    while ((BigInt(MemoryStructure.MAX_ADDRESS) >> BigInt(digits * 4)) > 0)
        digits++;

    const stack = [];
    const lastFrame = props.memory.frames[props.memory.frames.length - 1];
    const renderFrames = [...props.memory.frames, props.stackPointer - 1n]
    for (let i = 0; i < props.memory.stack.length; i += 8) {
        const dwordBytes = [];
        for (let j = i, k = false; j < i + 8; j++) {
            const address = MemoryStructure.MAX_ADDRESS - j;
            const addressText = address.toString(16).padStart(digits, '0').toUpperCase();
            const value = j < props.memory.stack.length ? props.memory.stack[j] : 0n;

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
            
            if (props.stackPointer > address) {
                additionalStyles += ` ${styles['unscoped']}`;
            } else if (lastFrame >= address) {
                additionalStyles += ` ${styles['frame-data-primary']}`;
            } else {
                additionalStyles += ` ${styles['frame-data']}`;
            }

            if (props.stackPointer == address)
                additionalStyles += ` ${styles.sp}`;

            dwordBytes.unshift(
                <td key={j} className={`${styles.value} ${additionalStyles}`}>
                    <PopUp title={addressText} flipX={j - i < 6} flipY={i < 24}>
                        Decimal: {value.toString()}
                        <br />
                        Binary: {value.toString(2).padStart(8, '0')}
                    </PopUp>
                    {bigIntToHexString(value, 8)}
                </td>
            );
        }
        const address = MemoryStructure.MAX_ADDRESS - (i + 7);
        const addressText = address.toString(16).padStart(digits, '0').toUpperCase();
        stack.push(
            <tr key={`block${i}`} className={styles.block}>
                <td className={`${styles.addr} ${(props.stackPointer >= address && props.stackPointer < address + 8) ? styles.sp : ''}`}>
                    <PopUp title={addressText} flipY={i < 16}>
                        Value: {bigIntArrayToBigInt(props.memory.stack.slice(i, i + 8).reverse(), 8n).toString()}
                    </PopUp>
                    {addressText}
                </td>
                {dwordBytes}
            </tr>
        );
    }

    const text = [];
    for (let i = 0; i < props.memory.text.length; i += 8) {
        const dwordBytes = [];
        for (let j = i; j < i + 8; j++) {
            const addressText = (j).toString(16).padStart(digits, '0').toUpperCase();
            const value = j < props.memory.text.length ? props.memory.text[j] : 0n;
            dwordBytes.push(
                <td key={j} className={styles.value}>
                    <PopUp title={addressText} flipX={j - i > 1}>
                        Decimal: {value.toString()}
                        <br />
                        Binary: {formatBinary(value, 8)}
                    </PopUp>
                    {bigIntToHexString(value, 8)}
                </td>
            );
        }
        const addressText = (i).toString(16).padStart(digits, '0');
        text.unshift(
            <tr key={`block${i}`} className={styles.block}>
                <td className={styles.addr}>
                    <PopUp title={addressText}>
                        Value: {bigIntArrayToBigInt(props.memory.text.slice(i, i + 8), 8n).toString()}
                    </PopUp>
                    {addressText}
                </td>
                {dwordBytes}
            </tr>
        );
    }


    return (
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
    );
}

export default Memory;