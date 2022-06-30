/**
 * A mutable typed array of bytes.
 */
export default class ByteArray {
    /**
     * Create an empty array of bytes.
     */
    constructor() {
        this.data = [];
        this.length = 0;
    }

    /**
     * Increase array length to `size` if it is
     * not already at least that long.
     * @param {number} size 
     */
    expandTo(size) {
        while (this.data.length < size)
            this.data.push(0n);
        this.length = this.data.length;
    }

    /**
     * Set a specific byte's value.
     * @param {number} i Index of byte to set
     * @param {bigint} byte Byte value
     */
    set(i, byte) {
        if (typeof byte !== 'bigint')
            throw 'ByteArray.set: byte value must be of type bigint';

        if (byte > 0b11111111n || byte < 0n)
            throw 'ByteArray.set: byte value must be within [0, 255]';
        
        if (i < 0 || i >= this.data.length)
            throw 'ByteArray.set: index out of bounds';

        this.data[i] = byte;
    }

    /**
     * Set a sequence of bytes by decomposing a
     * given value. The sign of `length` determines
     * which direction `value` will be spilled in.
     * @param {number} start Address of first byte
     * @param {bigint} value Value to decompose
     * @param {number} length Number of bytes to set
     */
    setBytes(start, value, length) {
        if (typeof value !== 'bigint')
            throw 'ByteArray.setBytes: value must be of type bigint';
        
        if ((length > 0 && (start < 0 || start + length >= this.data.length))
            || (length < 0 && (start >= this.data.length || start + length < 0)))
            throw 'ByteArray.setBytes: index out of bounds';

        for (let i = start, j = 0n; (length > 0) ? (i < start + length) : (i > start - length); (length > 0 ? i++ : i--), j += 8n) {
            this.data[i] = (value >> j) & 0b11111111n;
        }
    }

    /**
     * Get a specific byte's value.
     * @param {number} i Index of byte to set
     * @returns {bigint}
     */
    get(i) {
        if (i < 0 || i >= this.data.length)
            throw 'ByteArray.set: index out of bounds'

        return this.data[i];
    }

    /**
     * Get a sequence of bytes as one value by composing
     * them. The sign of `length` determines which
     * direction bytes will be aggregated in.
     * @param {number} start Address of first byte
     * @param {number} length Number of bytes to set
     * @returns {bigint}
     */
    getBytes(start, length) {
        if ((length > 0 && (start < 0 || start + length >= this.data.length))
            || (length < 0 && (start >= this.data.length || start + length < 0)))
            throw 'ByteArray.getBytes: index out of bounds';

        let value = 0n;
        for (let i = start + length + (length > 0 ? -1 : 1); (length > 0) ? (i >= start) : (i <= start); (length > 0 ? i-- : i++)) {
            value = (value << 8n) | this.data[i];
        }

        return value;
    }
};