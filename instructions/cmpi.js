import { ArgumentType } from "@inst/instruction";
import SUBISInstruction from "./subis";

class CMPIInstruction extends SUBISInstruction {
    static mnemonic = 'cmp';
    static syntax = [ArgumentType.Register, ArgumentType.Immediate];
    static restrictions = [null, 11];

    constructor(rn, imm11) {
        super(31, rn, imm11);
    }
}

export default CMPIInstruction;