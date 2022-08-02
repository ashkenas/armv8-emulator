import React from "react";

/**
 * Displays numbers as binary.
 */
export default function BinaryNumber({ value, length }) {
    if (value < 0)
        value = (1 << length) + value;
    return <>{value.toString(2).padStart(length, '0')}</>;
};