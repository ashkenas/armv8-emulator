import React from 'react';
import ScrollContent from "@components/scrollContent";
import MemoryStructure from "@util/memoryStructure";
import {bigIntArrayToBigInt, bigIntToHexString} from '@util/formatUtils';
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
    for (let i = 0; i < props.memory.stack.length / 8; i += 8) {
        stack.push(
            <tr key={`block${i}`} className={styles.block}>
                <td className={styles.addr}>{(MemoryStructure.MAX_ADDRESS - (i + 7)).toString(16).padStart(digits, '0')}<sub>16</sub>
                </td>
                <td className={styles.value}>{bigIntToHexString(bigIntArrayToBigInt(props.memory.stack.slice(i, i + 8).reverse(), 8n), 64)}</td>
            </tr>
        );
    }

    const text = [];
    for (let i = 0; i < props.memory.text.length; i += 8) {
        text.unshift(
            <tr key={`block${i}`} className={styles.block}>
                <td className={styles.addr}>{(i).toString(16).padStart(digits, '0')}<sub>16</sub></td>
                <td className={styles.value}>{bigIntToHexString(bigIntArrayToBigInt(props.memory.text.slice(i, i + 8), 8n), 64)}</td>
            </tr>
        );
    }


    return (
        <ScrollContent>
            <table className={styles.memory}>
                <thead>
                <tr>
                    <th className={styles.header}>Address</th>
                    <th className={styles.header}>Value</th>
                </tr>
                </thead>
                <tbody>
                {stack}
                <tr className={styles.spacer}>
                    <td>⋮</td>
                    <td>⋮</td>
                </tr>
                {text}
                </tbody>
            </table>
        </ScrollContent>
    );
}

export default Memory;