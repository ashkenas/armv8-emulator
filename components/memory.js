import React from 'react'

class Memory extends React.Component {
    static MAX_ADDRESS = 0x10000000000n;

    constructor(props) {
        super(props);
    }
    
    writeDoubleWord(address, doubleWord) {
        if (typeof doubleWord !== 'bigint')
            throw `Attempted to write '${typeof doubleWord}' instead of a 'BigInt'!`;
        
        if (typeof address !== 'bigint')
            address = BigInt(address);

        if (address % 8n !== 0n)
            throw 'Attempted to write a double word offset from a double word boundary!';

        if (address > Memory.MAX_ADDRESS - 7n)
            throw 'Tried to write above stack!';
        
        if (address < this.bssStartAddress)
            throw 'Tried to write below BSS!';

        // Write to appropriate array (stack/BSS)
        if (address < this.bssEndAddress) {
            this.program[address / 8n] = doubleWord;
        } else {
            while (address < Memory.MAX_ADDRESS - BigInt(this.stack.length) * 8n)
                this.stack.push(0n);
    
            this.stack[(Memory.MAX_ADDRESS - address) / 8n] = doubleWord;
        }
    }

    readDoubleWord(address) {
        if (typeof address !== 'bigint')
            address = BigInt(address);
        
        if (address % 8n !== 0n)
            throw 'Attempted to read a double word offset from a double word boundary!';

        if (address > Memory.MAX_ADDRESS - 7n)
            throw 'Tried to read above stack!';
        
        if (address < this.bssStartAddress)
            throw 'Tried to read below BSS!';

        // Read from appropriate array (stack/BSS)
        if (address < this.bssEndAddress) {
            return this.program[address / 8n];
        } else {
            while (address < Memory.MAX_ADDRESS - BigInt(this.stack.length) * 8n)
                this.stack.push(0n);
    
            return this.stack[(Memory.MAX_ADDRESS - address) / 8n];
        }
    }

    storeProgram(program) {
        this.program = new BigUint64Array();

        // Turn 32 bit encodings into 64 bit blocks
        let i = 0;
        for(; i < program.length - (program.length % 2); i += 2)
            this.program.push((BigInt(program[i + 1].encoding) << 32) + BigInt(program[i].encoding));
        
        if (program.length % 2)
            this.program.push(BigInt(program[program.length - 1].encoding));
        
        this.bssStartAddress = BigInt(this.program.length * 8);
        this.bssEndAddress = this.bssStartAddress + BigInt(program.bssSize);
        this.bssEndAddress += 7n - (this.bssEndAddress % 8n); // Align BSS on double word boundary

        while (this.program.length * 8 < this.bssEndAddress)
            this.program.push(0n);

        this.stack = BigUint64Array.of(0n);
    }

    render() {
        return <></>;
    }
}

export default Memory;