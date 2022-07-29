/**
 * Returns an expanded array should `array` be smaller than `size`.
 * @param {any[]} array Array to expand
 * @param {number} size Minimum size
 * @returns 
 */
 export function expandTo(array, size, fill = 0n) {
    if (array.length < size)
        return Array.from(Array(size), (v, i) => i < array.length ? array[i] : fill);
    return [...array];
};

/**
 * Set a specific byte's value.
 * @param {bigint[]} array Array to set byte in
 * @param {number} i Index of byte to set
 * @param {bigint} byte Byte value
 */
export function setByte(array, i, byte) {
    if (typeof byte !== 'bigint')
        throw 'ByteArray.set: byte value must be of type bigint';

    if (byte > 0b11111111n || byte < 0n)
        throw 'ByteArray.set: byte value must be within [0, 255]';
    
    if (i < 0 || i >= array.length)
        throw 'ByteArray.set: index out of bounds';

    array[i] = byte;
};

/**
 * Set a sequence of bytes by decomposing a
 * given value. The sign of `length` determines
 * which direction `value` will be spilled in.
 * @param {bigint[]} array Array to set bytes in
 * @param {number} start Address of first byte
 * @param {bigint} value Value to decompose
 * @param {number} length Number of bytes to set
 */
export function setBytes(array, start, value, length) {
    if (typeof value !== 'bigint')
        throw 'ByteArray.setBytes: value must be of type bigint';
    
    if ((length > 0 && (start < 0 || start + length > array.length))
        || (length < 0 && (start >= array.length || start + length + 1 < 0)))
        throw 'ByteArray.setBytes: index out of bounds';

    for (let i = start, j = 0n; (length > 0) ? (i < start + length) : (i > start + length); (length > 0 ? i++ : i--), j += 8n)
        array[i] = (value >> j) & 0b11111111n;
};

/**
 * Get a sequence of bytes as one value by composing
 * them. The sign of `length` determines which
 * direction bytes will be aggregated in.
 * @param {bigint[]} array Array to get bytes from
 * @param {number} start Address of first byte
 * @param {number} length Number of bytes to set
 * @returns {bigint}
 */
export function getBytes(array, start, length) {
    if ((length > 0 && (start < 0 || start + length - 1 >= array.length))
        || (length < 0 && (start >= array.length || start + length + 1 < 0)))
        throw 'ByteArray.getBytes: index out of bounds';

    let value = 0n;
    for (let i = start + length + (length > 0 ? -1 : 1); (length > 0) ? (i >= start) : (i <= start); (length > 0 ? i-- : i++))
        value = (value << 8n) | array[i];

    return value;
};
