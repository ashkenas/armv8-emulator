import React from "react";

/**
 * Displays numbers as binary.
 */
export default function BinaryNumber({ value, length }) {
    return <>{value.toString(2).padStart(length, '0')}</>;
};