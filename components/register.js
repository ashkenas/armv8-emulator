import React from 'react';
import styles from '../styles/Register.module.css';

class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = { value: 0n };
    }

    setValue(value) {
        this.setState({ value: value });
    }

    getValue() {
        return this.state.value;
    }

    render() {
        const hex = [];
        
        let currVal = this.state.value;
        for (let i = 0; i < 8; i++) {
            hex.unshift((currVal & 0b11111111n).toString(16).toLocaleUpperCase().padStart(2, '0'));
            currVal >>= 8n;
        }
        return <div className={styles.register}>{this.props.registerName}: <span className={styles.value}>{hex.join(' ')}</span></div>;
    }
}

export default Register;