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
                    <div key={signal}>{signal}: {this.props.signals[signal]}</div>
                )}
            </ScrollContent>
        );
    }
}

export default ControlSignals;