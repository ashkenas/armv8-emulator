import { Instruction, ArgumentType } from "@inst/instruction";

class CMPIInstruction extends Instruction {
    static mnemonic = 'cmp';
    static syntax = [ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, 11];

    constructor(rn, imm11) {
        super(31, rn, imm11);
    }
}

export default CMPIInstruction;