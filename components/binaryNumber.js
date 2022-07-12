import React from "react";

/**
 * Displays numbers as binary, properly showing
 * negative numbers as their two's complement.
 */
export default class BinaryNumber extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let displayVal = this.props.value;
        if(this.props.value < 0)
            displayVal = (1 << this.props.length) + displayVal;

        return <>{displayVal.toString(2).padStart(this.props.length, '0')}</>;
    }
};