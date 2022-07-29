import { ArgumentType } from "@inst/instruction";
import SUBSInstruction from "./subs";

class CMPInstruction extends SUBSInstruction {
    static mnemonic = 'cmp';
    static syntax = [ArgumentType.Register, ArgumentType.Register];
    static restrictions = [null, null];

    constructor(rn, rm) {
        super(31, rn, rm);
    }
}

export default CMPInstruction;