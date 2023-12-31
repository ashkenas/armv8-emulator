import React from 'react';
import ScrollContent from '@components/scrollContent';
import styles from '@styles/ControlSignals.module.css';
import { useSelector } from 'react-redux';

function ControlSignals(props) {
    const signals = useSelector((state) => state.controlSignals);
    const highlight = useSelector((state) => state.newSignals);

    return (
        <ScrollContent>
            <table>
                <tbody>
                    {Object.keys(signals).map((signal) =>
                        <tr key={signal} className={signal in highlight ? styles.highlight : ''}>
                            <td className={styles.signal}>
                                {signal.toLowerCase() === signal ? signal.toUpperCase() : signal[0].toUpperCase() + signal.substring(1)}
                            </td>
                            <td>
                                {signals[signal].toString(2).padStart(signal === 'aluOp' ? 2 : 1, '0')}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </ScrollContent>
    );
}

export default ControlSignals;