import React from 'react';
import styles from '../styles/Register.module.css';
import { bigIntToHexString } from '../util/formatUtils';

class Register extends React.Component {
    constructor(props) {
        super(props);
    }

    setBit(bit, value) {
        if (value > 1 || value < 0)
            throw `Bit value must be '0' or '1'!`;
        
        if (typeof value !== 'bigint')
            value = BigInt(value);

        if (typeof bit !== 'bigint')
            bit = BigInt(bit);
        
        const mask = (2n ** 65n) - 1n - (2n ** bit);
        this.setValue((this.getValue() & mask) | (value << bit))
    }

    getBit(bit) {
        return (this.state.value >> BigInt(bit)) & 1n;
    }

    render() {
        return (
            <div className={styles.register}>
                {this.props.registerName}:
                <span className={styles.value}>
                    {bigIntToHexString(this.props.value, 64)}
                </span>
            </div>
        );
    }
}

export default Register;