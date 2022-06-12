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

        while (address < Memory.MAX_ADDRESS - BigInt(this.stack.length) * 8n) // check math
            this.stack.push(0n);

        this.stack[(Memory.MAX_ADDRESS - address) / 8n] = doubleWord
    }

    storeProgram(program) {
        this.program = new BigUint64Array();

        // Turn 32 bit encodings into 64 bit blocks
        let i = 0;
        for(; i < program.length - (program.length % 2); i += 2)
            this.program.push((BigInt(program[i + 1]) << 32) + BigInt(program[i]));
        
        if (program.length % 2)
            this.program.push(BigInt(program[program.length - 1]));
        
        this.bssStartAddress = i * 32;
        this.bssEndAddress = this.bssStartAddress + program.bssSize;
        this.stack = BigUint64Array.of(0n);
    }

    render() {
        return <></>;
    }
}

export default Memory;