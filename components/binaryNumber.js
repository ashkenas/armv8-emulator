import React from "react";

/**
 * Displays numbers as binary, properly showing
 * negative numbers as their two's complement.
 */
export default function BinaryNumber(props) {
    let displayVal = props.value;
    if (props.value < 0)
        displayVal = (1 << props.length) + displayVal;

    return <>{displayVal.toString(2).padStart(props.length, '0')}</>;
};