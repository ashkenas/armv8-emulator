import { ArgumentType, Instruction } from "@inst/instruction";

class SVCInstruction extends Instruction {
    static mnemonic = 'svc';
    static syntax = [ArgumentType.Immediate];
    static restrictions = [0];
    
    constructor(imm11) {
        super(0b11010100000);
        this.encodeInstruction();
        this.setControlSignals(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }

    wb(simulator) {
        return { exit: true };
    }
}

export default SVCInstruction;