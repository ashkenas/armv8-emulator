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
 * @returns {bigint}
 */
export function bigIntArrayToBigInt(data) {
    let result = 0n;

    for(let i = data.length - 1; i >= 0; i--)
        result = (result << 64n) + data[i];

    return result;
}