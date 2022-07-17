import { Instruction } from "@inst/instruction";

class NOPInstruction extends Instruction {
    static mnemonic = 'nop';
    static syntax = [];
    static restrictions = [];
    
    constructor() {
        super(0b11010101000);
        this.encodeInstruction();
        this.setControlSignals(null, null, null, null, null, null, null, null, null, null, null);
    }
}

export default NOPInstruction;