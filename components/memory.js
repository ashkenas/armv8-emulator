import React from 'react'
import ByteArray from '../util/byteArray';

/**
 * React Component representing a virtual memory space for a process.
 */
class Memory extends React.Component {
    /**
     * Address of the start of the stack.
     */
    static MAX_ADDRESS = 0x40000000 - 1;

    constructor(props) {
        super(props);
    }

    /**
     * Write a byte to memory at a specific location.
     * @param {number} address Byte address
     * @param {bigint} byte Byte value
     */
    writeByte(address, byte) {
        if (typeof byte !== 'bigint')
            throw "Only type 'bigint' can be written to memory.";

        if (byte < 0 || byte > 0b11111111n)
            throw 'Byte value must be within [0, 255].'
        
        if (address >= Memory.MAX_ADDRESS)
            throw 'Tried to write outside virtual memory.';

        if (address < this.bssStartAddress)
            throw 'Tried to write to read-only memory.';

        if (address <= this.bssEndAddress) {
            this.program.setByte(address, byte);
        } else {
            this.stack.expandTo(Memory.MAX_ADDRESS - address);
            this.stack.setByte(Memory.MAX_ADDRESS - address, byte)
        }
    }
    
    /**
     * Write eight bytes to memory, starting at a
     * specific location.
     * @param {number} address Start address
     * @param {bigint} doubleWord Long value
     */
    writeDoubleWord(address, doubleWord) {
        if (typeof doubleWord !== 'bigint')
            throw "Only type 'bigint' can be written to memory.";

        if (address + 7 > Memory.MAX_ADDRESS)
            throw 'Tried to write outside of virtual memory.';
        
        if (address < this.bssStartAddress)
            throw 'Tried to write to read-only memory.';

        // Write to appropriate array (stack/BSS)
        if (address <= this.bssEndAddress) {
            // TODO: error if address less than bss end but length takes it into stack
            this.program.setBytes(address, doubleWord, 8);
        } else {
            this.stack.expandTo(Memory.MAX_ADDRESS - address);
            this.stack.setBytes(Memory.MAX_ADDRESS - address, doubleWord, -8)
        }
    }

    /**
     * Read a byte from a specific location in memory.
     * @param {number} address Byte address
     * @returns {bigint}
     */
    readByte(address) {
        if (address >= Memory.MAX_ADDRESS || address < 0)
            throw 'Tried to write outside virtual memory.';

        if (address <= this.bssEndAddress) {
            return this.program.getByte(address);
        } else {
            this.stack.expandTo(Memory.MAX_ADDRESS - address);
            return this.stack.getByte(Memory.MAX_ADDRESS - address)
        }
    }

    /**
     * Read eight bytes, starting at a
     * specific location in memory.
     * @param {number} address Start address
     * @returns {bigint} Long integer
     */
    readDoubleWord(address) {
        if (address + 7 > Memory.MAX_ADDRESS || address < 0)
            throw 'Tried to read outside virtual memory.';

        // Read from appropriate array (stack/BSS)
        if (address <= this.bssEndAddress) {
            // TODO: error if address less than bss end but length takes it into stack
            return this.program.getBytes(address, 8);
        } else {
            this.stack.expandTo(Memory.MAX_ADDRESS - address);
            return this.stack.getBytes(Memory.MAX_ADDRESS - address, 8);
        }
    }

    /**
     * Encodes a program's instructions and initialized
     * data into the virtual memory space.
     * @param {Program} program Program to load
     */
    storeProgram(program) {
        this.program = new ByteArray();
        this.program.expandTo(program.instructions.length * 4 + program.initSize + program.bssSize);

        for(let i = 0; i < program.instructions.length; i++)
            this.program.setBytes(i, BigInt(program.instructions[i + 1].encoding), 4);
        
        for(const {value, length, address} of program.initData)
            this.program.setBytes(address, value, length);
        
        this.bssStartAddress = BigInt(program.instructions.length * 4 + program.initSize);
        this.bssEndAddress = this.bssStartAddress + BigInt(program.bssSize) - 1;

        this.stack = new ByteArray();
        this.stack.expandTo(8);
    }

    render() {
        if (!this.program)
            return <></>;

        // Count hex digits in max address
        let digits = -1;
        while ((this.MAX_ADDRESS >> BigInt((digits + 1) * 8)) > 0)
            digits += 1;
        
        return <>{[...this.program].map((val, i) =>
            <div key={`block${i}`} className={styles.dword}>
                {(i*8).toString(16).padStart(digits, '0')}:
                <span className={styles.value}>{bigIntToHexString(val, 64)}</span>
            </div>
        ).concat([...this.stack].map((val, i) =>
            <div key={`block${i}`} className={styles.dword}>
                {(this.MAX_ADDRESS - BigInt(i*8)).toString(16).padStart(digits, '0')}:
                <span className={styles.value}>{bigIntToHexString(val, 64)}</span>
            </div>
        ))}</>;
    }
}

export default Memory;