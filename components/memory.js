import React from 'react';
import ScrollContent from "@components/scrollContent";
import MemoryStructure from "@util/memoryStructure";
import { bigIntToHexString } from '@util/formatUtils';
import styles from '@styles/Memory.module.css';

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
        for (let j = i, k = false; j < i + 8 && j < props.memory.stack.length; j++) {
            let additionalStyles = '';
            if (renderFrames.includes(BigInt(MemoryStructure.MAX_ADDRESS - j))) {
                if (lastFrame >= MemoryStructure.MAX_ADDRESS - j)
                    additionalStyles = styles['frame-start-primary'];
                else
                    additionalStyles = styles['frame-start'];
                k = true;
            } else if(k) {
                if (lastFrame > MemoryStructure.MAX_ADDRESS - j)
                    additionalStyles = styles['frame-boundary-primary'];
                else
                    additionalStyles = styles['frame-boundary'];
            }
            
            if (props.stackPointer > MemoryStructure.MAX_ADDRESS - j)
                additionalStyles += ` ${styles['unscoped']}`;

            dwordBytes.unshift(
                <td key={j} className={`${styles.value} ${additionalStyles}`}>
                    {bigIntToHexString(props.memory.stack[j], 8)}
                </td>
            )
        }
        stack.push(
            <tr key={`block${i}`} className={styles.block}>
                <td className={styles.addr}>
                    {(MemoryStructure.MAX_ADDRESS - (i + 7)).toString(16).padStart(digits, '0')}
                    <sub>16</sub>
                </td>
                {dwordBytes}
            </tr>
        );
    }

    const text = [];
    for (let i = 0; i < props.memory.text.length; i += 8) {
        const dwordBytes = [];
        for (let j = i; j < i + 8; j++) {
            dwordBytes.push(
                <td key={j} className={styles.value}>
                    {bigIntToHexString(j < props.memory.text.length ? props.memory.text[j] : 0n, 8)}
                </td>
            )
        }
        text.unshift(
            <tr key={`block${i}`} className={styles.block}>
                <td className={styles.addr}>
                    {(i).toString(16).padStart(digits, '0')}
                    <sub>16</sub>
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