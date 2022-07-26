import { Instruction, ArgumentType } from "@inst/instruction";

class CMPInstruction extends Instruction {
    static mnemonic = 'cmp';
    static syntax = [ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null];

    constructor(rn, rm) {
        super(31, rn, rm);
    }
}

export default CMPInstruction;