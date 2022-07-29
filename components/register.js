import React from 'react';
import { bigIntToHexString } from '@util/formatUtils';
import styles from '@styles/Register.module.css';

// setBit(bit, value) {
//     if (value > 1 || value < 0)
//         throw `Bit value must be '0' or '1'!`;
    
//     if (typeof value !== 'bigint')
//         value = BigInt(value);

//     if (typeof bit !== 'bigint')
//         bit = BigInt(bit);
    
//     const mask = (1n << 65n) - 1n - (1n << bit);
//     this.setValue((this.getValue() & mask) | (value << bit))
// }

// getBit(bit) {
//     return (this.state.value >> BigInt(bit)) & 1n;
// }

export default function Register({ registerName, value, highlight, onMouseOver, onMouseLeave }) {
    return (
        <div className={`${styles.register} ${highlight ? styles.highlight : ''}`}>
            {registerName}:
            <span className={styles.value} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
                {bigIntToHexString(value < 0 ? (1n << 64n) + value : value, 64)}
            </span>
        </div>
    );
}
