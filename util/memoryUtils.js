import { expandTo, getBytes, setByte, setBytes } from "@util/byteArray";
import { nextMultiple } from "./formatUtils";
import { addFrame, merge, removeFrame, store, updateBytes } from "./reduxUtils";

export const MAX_ADDRESS = 0x40000000 - 1;

/**
 * Sets up virtual memory for a given program.
 * @param {Program} program
 */
export function initializeMemory(program) {
    const textData = expandTo([], program.programSize + program.initSize + program.bssSize);

    for(let i = 0; i < program.instructions.length; i++)
        setBytes(textData, i*4, BigInt(program.instructions[i].encoding), 4);

    for(const {value, length, address} of program.initData) {
        setBytes(textData, address, value, length);
    }
    
    const bssStartAddress = program.programSize + program.initSize;
    const bssEndAddress = bssStartAddress + program.bssSize - 1;

    const stackData = expandTo([], 40);

    const frames = [BigInt(MAX_ADDRESS)];

    store.dispatch(merge({
        programSize: program.programSize,
        bssStartAddress: bssStartAddress,
        bssEndAddress: bssEndAddress,
        textData: textData,
        stackData: stackData,
        frames: frames
    }));
}

/**
 * Write bytes to memory, starting at a specific location.
 * @param {number} address Start address
 * @param {bigint} value Long value
 * @param {number} size Number of bytes to write
 */
export function writeBytes(address, value, size) {
    if (typeof value !== 'bigint')
        throw "Only type 'bigint' can be written to memory.";

    if (address + size - 1 > MAX_ADDRESS || address < 0)
        throw 'Segmentation fault. Attempted to write outside of virtual memory.\n\nTip:\nMake sure you\'re moving the stack pointer in the right direction.';

    const state = store.getState();
    
    if (address < state.bssStartAddress)
        throw 'Segmentation fault. Attempted to write to read only memory.\n\nTip:\nYou cannot write to locations in the .text or .data sections.';

    if (address <= state.bssEndAddress && address + size - 1 > state.bssEndAddress)
        throw 'Warning: Attempted to write to an address in BSS that was too close to the stack boundary.\n\nTip:\nMake sure you allocate enough space to your variables.';

    store.dispatch(updateBytes(address, value, size));
}

/**
 * Read bytes, starting at a specific location in memory.
 * @param {number} address Start address
 * @param {number} size Number of bytes to read
 * @returns {bigint} Long integer
 */
export function readBytes(address, size) {
    if (address + size - 1 > MAX_ADDRESS || address < 0)
        throw 'Segmentation fault. Attempted to read from outside of virtual memory.\n\nTip:\nMake sure you\'re moving the stack pointer in the right direction.';

    const state = store.getState();

    // Read from appropriate array (stack/BSS)
    if (address <= state.bssEndAddress) {
        if (address + size - 1 > state.bssEndAddress)
            throw 'Warning: Attempted to read from an address in BSS that was too close to the stack boundary.\n\nTip:\nMake sure you allocate enough space to your variables.';
        return getBytes(state.textData, address, size);
    } else {
        const tempStack = expandTo(state.stackData, nextMultiple(MAX_ADDRESS - address + 1, 8) + 8);
        return getBytes(tempStack, MAX_ADDRESS - address, -size);
    }
}