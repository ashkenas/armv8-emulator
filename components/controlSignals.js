import React from 'react';
import ScrollContent from '@components/scrollContent';

function ControlSignals(props) {
    if (!props.signals)
        return <></>;

    return (
        <ScrollContent>
            {Object.keys(props.signals).map((signal) =>
                <div key={signal}>
                    {signal.toLowerCase() === signal ? signal.toUpperCase() : signal[0].toUpperCase() + signal.substring(1)}:&nbsp;
                    {props.signals[signal].toString(2).padStart(signal === 'aluOp' ? 2 : 1, '0')}<sub>2</sub>
                </div>
            )}
        </ScrollContent>
    );
}

export default ControlSignals;