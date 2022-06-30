import React from 'react';
import Register from './register';
import Memory from './memory';
import styles from '../styles/Registers.module.css';

class Registers extends React.Component {
    constructor(props) {
        super(props);

        this.col1 = [];
        for (let i = 0; i < 16; i++) {
            this.col1.push(<Register key={`register${i}`} registerName={'X' + i} />);
        }

        this.col2 = [<Register key={'register28'} registerName="SP" value={BigInt(Memory.MAX_ADDRESS - 7)} />,
                     <Register key={'register29'} registerName="FP" value={BigInt(Memory.MAX_ADDRESS - 7)} />,
                     <Register key={'register30'} registerName="LR" />,
                     <Register key={'register31'} registerName="XZR" />];
        for (let i = 27; i > 15; i--) {
            this.col2.unshift(<Register key={`register${i}`} registerName={'X' + i} />);
        }

        this.registers = [...this.col1, ...this.col2]
        this.flags = <Register registerName="FLAGS" />
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

    resetRegisters() {
        for(const register of this.registers)
            register.setValue(0n);
    }

    render() {
        return (
            <div className={styles.row}>
                <div className={styles.column}>
                    {this.col1}
                </div>
                <div className={styles.column}>
                    {this.col2}
                </div>
            </div>
        );
    }
}

export default Registers;