import React from 'react';
import ScrollContent from './scrollContent';

class ControlSignals extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.signals)
            return <></>;

        return (
            <ScrollContent>
                {Object.keys(this.props.signals).map((signal) => 
                    <div key={signal}>
                        {signal.toLowerCase() === signal ? signal.toUpperCase() : signal[0].toUpperCase() + signal.substring(1)}:&nbsp;
                        {this.props.signals[signal].toString(2).padStart(signal === 'aluOp' ? 2 : 1, '0')}<sub>2</sub>
                    </div>
                )}
            </ScrollContent>
        );
    }
}

export default ControlSignals;