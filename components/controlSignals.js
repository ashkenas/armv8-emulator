import React from 'react';

class ControlSignals extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (!this.props.signals)
            return <></>;

        return (
            <p>
                {Object.keys(this.props.signals).map((signal) => 
                    <span key={signal}>{signal}: {this.props.signals[signal]}</span>
                )}
            </p>
        );
    }
}

export default ControlSignals;