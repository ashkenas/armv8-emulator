import React from 'react'
import ByteArray from '../util/byteArray';

class Memory extends React.Component {
    static MAX_ADDRESS = 0x40000000 - 1;

    constructor(props) {
        super(props);
    }
    
    writeDoubleWord(address, doubleWord) {
        if (typeof doubleWord !== 'bigint')
            throw `Attempted to write type '${typeof doubleWord}' instead of a 'bigint'!`;

        if (address + 7 > Memory.MAX_ADDRESS)
            throw 'Tried to write above stack!';
        
        if (address < this.bssStartAddress)
            throw 'Tried to write below BSS!';

        // Write to appropriate array (stack/BSS)
        if (address <= this.bssEndAddress) {
            // TODO: error if address less than bss end but length takes it into stack
            this.program.setBytes(address, doubleWord, 8);
        } else {
            this.stack.expandTo(Memory.MAX_ADDRESS - address);
            this.stack.setBytes(Memory.MAX_ADDRESS - address, doubleWord, -8)
        }
    }

    readDoubleWord(address) {
        if (address + 7 > Memory.MAX_ADDRESS)
            throw 'Tried to read above stack!';
        
        if (address < this.bssStartAddress)
            throw 'Tried to read below BSS!';

        // Read from appropriate array (stack/BSS)
        if (address <= this.bssEndAddress) {
            // TODO: error if address less than bss end but length takes it into stack
            return this.program.getBytes(address, 8);
        } else {
            this.stack.expandTo(Memory.MAX_ADDRESS - address);
            return this.stack.getBytes(Memory.MAX_ADDRESS - address, 8);
        }
    }

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