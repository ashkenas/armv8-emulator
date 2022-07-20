import React from 'react';
import { bigIntToHexString } from '@util/formatUtils';
import styles from '@styles/Register.module.css';
import PopUp from './popUp';

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

export default function Register(props) {
    return (
        <div className={styles.register}>
            {props.registerName}:
            <span className={styles.value}>
                <PopUp title={props.registerName}>
                    {props.value.toString()}
                </PopUp>
                {bigIntToHexString(props.value < 0 ? (1n << 64n) + props.value : props.value, 64)}
            </span>
        </div>
    );
}
