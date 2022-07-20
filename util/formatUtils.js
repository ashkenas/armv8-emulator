/**
 * Convert a BigInt to a hex string broken up by byte.
 * If `data` is not big enough, zeroed bytes will be padded on.
 * @param {bigint} data Data to convert to hex
 * @param {number} bitLength Number of bits to convert
 * @returns {string}
 */
export function bigIntToHexString(data, bitLength) {
    if (typeof data !== 'bigint')
        throw "bigintToHexString: only 'bigint's are permitted!";
        
    const hex = [];
    for (let i = 0n; (data >> i) > 0; i += 8n)
        hex.unshift(((data >> i) & 0b11111111n).toString(16).toLocaleUpperCase().padStart(2, '0'));
    
    while (hex.length < bitLength / 8)
        hex.unshift('00');

    return hex.join(' ');
}

/**
 * Converts an array of bigint's into a single
 * large bigint.
 * @param {bigint[]} data Values to concatenate
 * @param {bigint} elemSize Size of each element in bits
 * @returns {bigint}
 */
export function bigIntArrayToBigInt(data, elemSize = 64n) {
    let result = 0n;

    for(let i = data.length - 1; i >= 0; i--)
        result = (result << elemSize) + data[i];

    return result;
}

/**
 * Returns the nearest multiple of `factor` to `value`
 * that is greater than `value`.
 * @param {number|bigint} value 
 * @param {number|bigint} factor 
 * @returns {number|bigint}
 */
export function nextMultiple(value, factor) {
    return ((value - (value % factor)) % factor) + value;
}

/**
 * Converts a number to a binary string with digit grouping.
 * @param {bigint} data Data to convert to binary
 * @param {number} bitLength Number of total binary digits
 * @param {number} groupSize Size of digit groups
 */
export function formatBinary(data, bitLength, groupSize = 4) {
    if (typeof data !== 'bigint')
        throw "formatBinary: only 'bigint's are permitted!";
        
    const bin = [];
    for (let i = 0n; (data >> i) > 0; i += BigInt(groupSize))
        bin.unshift(((data >> i) & ((1n << BigInt(groupSize)) - 1n)).toString(2).toLocaleUpperCase().padStart(groupSize, '0'));
    
    while (bin.length < bitLength / groupSize)
        bin.unshift(''.padStart(groupSize, '0'));

    return bin.join(' ');
}
