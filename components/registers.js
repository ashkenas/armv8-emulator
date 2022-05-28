import React from 'react';
import Register from './register';
import styles from '../styles/Registers.module.css';

class Registers extends React.Component {
    constructor(props) {
        super(props);

        this.col1 = [];
        for (let i = 0; i < 16; i++) {
            this.col1.push(<Register registerName={'X' + i} />);
        }

        this.col2 = [<Register registerName="XZR" />];
        for (let i = 30; i > 15; i--) {
            this.col2.unshift(<Register registerName={'X' + i} />);
        }

        this.registers = [...this.col1, ...this.col2]
    }

    setRegister(register, value) {
        if (register < 0 || register > 31)
            throw `Register X${register} does not exist!`;

        if (typeof value != 'bigint')
            throw `Cannot put value of type '${typeof value}' into register X${register}!`;

        this.registers[register].setValue(value);
    }

    getRegister(register) {
        if (register < 0 || register > 31)
            throw `Register X${register} does not exist!`;

        return this.registers[register].getValue(value);
    }

    render() {
        return (
            <div class={styles.row}>
                <div class={styles.column}>
                    {this.col1}
                </div>
                <div class={styles.column}>
                    {this.col2}
                </div>
            </div>
        );
    }
}

export default Registers;