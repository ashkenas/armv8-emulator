import React from 'react';
import styles from '../styles/Memory.module.css';
import MemoryStructure from "../util/memoryStructure";
import { bigIntArrayToBigInt, bigIntToHexString } from '../util/formatUtils';

/**
 * React Component representing a virtual memory space for a process.
 */
class Memory extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.memory.stack === null)
            return <></>;

        // Count hex digits in max address
        let digits = 0;
        while ((BigInt(MemoryStructure.MAX_ADDRESS) >> BigInt(digits * 4)) > 0)
            digits++;
        
        const stack = [];
        for(let i = 0; i < this.props.memory.stack.length / 8; i += 8) {
            stack.push(
                <tr key={`block${i}`} className={styles.block}>
                    <td className={styles.addr}>0x{(MemoryStructure.MAX_ADDRESS - (i + 7)).toString(16).padStart(digits, '0')}</td>
                    <td className={styles.value}>{bigIntToHexString(bigIntArrayToBigInt(this.props.memory.stack.slice(i, i + 8).reverse(), 8n), 64)}</td>
                </tr>
            );
        }

        const text = [];
        for(let i = 0; i < this.props.memory.text.length; i += 8) {
            text.unshift(
                <tr key={`block${i}`} className={styles.block}>
                    <td className={styles.addr}>0x{(i).toString(16).padStart(digits, '0')}</td>
                    <td className={styles.value}>{bigIntToHexString(bigIntArrayToBigInt(this.props.memory.text.slice(i, i + 8), 8n), 64)}</td>
                </tr>
            );
        }
            
        
        return (
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
        );
    }
}

export default Memory;