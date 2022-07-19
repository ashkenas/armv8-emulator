import React from 'react';
import ScrollContent from '@components/scrollContent';
import styles from '@styles/ControlSignals.module.css';

function ControlSignals(props) {
    if (!props.signals)
        return <></>;

    return (
        <ScrollContent>
            <table>
                <thead>
                    <tr>
                        <th className={styles.header}>Control Signal</th>
                        <th className={styles.header}>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(props.signals).map((signal) =>
                        <tr key={signal}>
                            <td className={styles.signal}>
                                {signal.toLowerCase() === signal ? signal.toUpperCase() : signal[0].toUpperCase() + signal.substring(1)}
                            </td>
                            <td>
                                {props.signals[signal].toString(2).padStart(signal === 'aluOp' ? 2 : 1, '0')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </ScrollContent>
    );
}

export default ControlSignals;