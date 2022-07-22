import ByteArray from "@util/byteArray";
import { nextMultiple } from "./formatUtils";

/**
 * Represents a program's virtual memory.
 */
 export default class MemoryStructure {
    /**
     * Starting address of the stack.
     */
    static MAX_ADDRESS = 0x40000000 - 1;

    /**
     * Creates virtual memory for a given program.
     * @param {Program} program
     */
    constructor(program, simulator) {
        this.simulator = simulator;

        this.text = new ByteArray();
        this.text.expandTo(program.programSize + program.initSize + program.bssSize);

        for(let i = 0; i < program.instructions.length; i++)
            this.text.setBytes(i*4, BigInt(program.instructions[i].encoding), 4);

        for(const {value, length, address} of program.initData) {
            this.text.setBytes(address, value, length);
        }
        
        this.bssStartAddress = BigInt(program.programSize + program.initSize);
        this.bssEndAddress = this.bssStartAddress + BigInt(program.bssSize) - 1n;

        this.stack = new ByteArray();
        this.stack.expandTo(8);

        this.frames = [BigInt(MemoryStructure.MAX_ADDRESS)];

        this.updateState();
    }

    /**
     * Refreshes all simulator information about the memory model.
     */
    updateState() {
        this.simulator.setState({ memory: { text: this.text.data, stack: this.stack.data, frames: this.frames } });
    }

    /**
     * Starts a new frame with topmost address `address`.
     * @param {number} address Frame top address 
     */
    pushFrame(address) {
        this.frames.push(address);
        this.updateState();
    }

    /**
     * Removes the active frame.
     */
    popFrame() {
        this.frames.pop();
    }

    /**
     * Expands the stack to be at least `newSize` bytes.
     * @param {number} newSize 
     */
    expandStack(newSize) {
        this.stack.expandTo(newSize);
        this.updateState();
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
        
        if (address > MemoryStructure.MAX_ADDRESS || address < 0)
            throw 'Segmentation fault. Attempted to write outside of virtual memory.\n\nTip:\nMake sure you\'re moving the stack pointer in the right direction.';

        if (address < this.bssStartAddress)
            throw 'Segmentation fault. Attempted to write to read only memory.\n\nTip:\nYou cannot write to locations in the .text or .data sections.';

        if (address <= this.bssEndAddress) {
            this.text.setByte(address, byte);
        } else {
            this.stack.expandTo(nextMultiple(MemoryStructure.MAX_ADDRESS - address + 1, 8) + 8);
            this.stack.setByte(MemoryStructure.MAX_ADDRESS - address, byte)
        }

        this.updateState();
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

        if (address + 7 > MemoryStructure.MAX_ADDRESS || address < 0)
            throw 'Segmentation fault. Attempted to write outside of virtual memory.\n\nTip:\nMake sure you\'re moving the stack pointer in the right direction.';
        
        if (address < this.bssStartAddress)
            throw 'Segmentation fault. Attempted to write to read only memory.\n\nTip:\nYou cannot write to locations in the .text or .data sections.';

        // Write to appropriate array (stack/BSS)
        if (address <= this.bssEndAddress) {
            if (address + 7 > this.bssEndAddress)
                throw 'Warning: Attempted to write to an address in BSS that was too close to the stack boundary.\n\nTip:\nMake sure you allocate enough space to your variables.';
            this.text.setBytes(address, doubleWord, 8);
        } else {
            this.stack.expandTo(nextMultiple(MemoryStructure.MAX_ADDRESS - address + 1, 8) + 8);
            this.stack.setBytes(MemoryStructure.MAX_ADDRESS - address, doubleWord, -8)
        }
        
        this.updateState();
    }

    /**
     * Read a byte from a specific location in memory.
     * @param {number} address Byte address
     * @returns {bigint}
     */
    readByte(address) {
        if (address > MemoryStructure.MAX_ADDRESS || address < 0)
            throw 'Segmentation fault. Attempted to read from outside of virtual memory.\n\nTip:\nMake sure you\'re moving the stack pointer in the right direction.';

        if (address <= this.bssEndAddress) {
            return this.text.getByte(address);
        } else {
            this.stack.expandTo(nextMultiple(MemoryStructure.MAX_ADDRESS - address + 1, 8) + 8);
            return this.stack.getByte(MemoryStructure.MAX_ADDRESS - address)
        }
    }

    /**
     * Read eight bytes, starting at a
     * specific location in memory.
     * @param {number} address Start address
     * @returns {bigint} Long integer
     */
    readDoubleWord(address) {
        if (address + 7 > MemoryStructure.MAX_ADDRESS || address < 0)
            throw 'Segmentation fault. Attempted to read from outside of virtual memory.\n\nTip:\nMake sure you\'re moving the stack pointer in the right direction.';

        // Read from appropriate array (stack/BSS)
        if (address <= this.bssEndAddress) {
            if (address + 7 > this.bssEndAddress)
                throw 'Warning: Attempted to read from an address in BSS that was too close to the stack boundary.\n\nTip:\nMake sure you allocate enough space to your variables.';
            return this.text.getBytes(address, 8);
        } else {
            this.stack.expandTo(nextMultiple(MemoryStructure.MAX_ADDRESS - address + 1, 8) + 8);
            return this.stack.getBytes(MemoryStructure.MAX_ADDRESS - address, -8);
        }
    }
}