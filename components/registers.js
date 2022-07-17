import React from 'react';
import Register from '@components/register';
import styles from '@styles/Registers.module.css';

class Registers extends React.Component {
    constructor(props) {
        super(props);

        this.registerLabels = ['SP', 'FP', 'LR', 'XZR'];
        for (let i = 27; i >= 0; i--)
            this.registerLabels.unshift(`X${i}`);
    }

    render() {
        const col1 = [], col2 = [];
        for (let i = 0; i < 16; i++) {
            col1.push(<Register key={`register${i}`} registerName={this.registerLabels[i]} value={this.props.values[i]} />);
            col2.push(<Register key={`register${i + 16}`} registerName={this.registerLabels[i + 16]} value={this.props.values[i + 16]} />);
        }

        return (
            <div className={styles.row}>
                <div className={styles.column}>
                    {col1}
                </div>
                <div className={styles.column}>
                    {col2}
                </div>
            </div>
        );
    }
}

export default Registers;