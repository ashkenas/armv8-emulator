export class ArgumentType {
    /* Maximum binary digits present in an ArgumentType value */
    static typeLength = 1;

    static Register = 0b1;
    static Immediate = 0b0;
};

export class Instruction {
    static _controlSignalNames = [
        'reg2Loc',
        'aluSrc',
        'aluOp',
        'cbr',
        'ubr',
        'pbr',
        'memWrite',
        'memRead',
        'memToReg',
        'linkReg',
        'regWrite',
    ];

    constructor(opcode) {
        this.cycle = 0;
        this.opcode = opcode;
    }

    encodeInstruction() {
        this.encoding = Number(BigInt(this.opcode) << 21n);

        if (this.rm)
            this.encoding += this.rm << 15;
        
        if (this.rn)
            this.encoding += this.rn << 5;
        
        if (this.rd)
            this.encoding += this.rd;
        
        if (this.rt)
            this.encoding += this.rt;
        
        if (this.imm11)
            this.encoding += this.imm11 << 10;
    }

    setControlSignals(...signals) {
        this.controlSignals = {};
        for(let i = 0; i < signals.length; i++) {
            if (signals[i] !== null)
                this.controlSignals[Instruction._controlSignalNames[i]] = signals[i];
        }
    }

    tick(cpu) {
        let flags = {};

        switch(this.cycle++) {
            case 0:
                flags = this.if ? this.if(cpu) : {};
                break;
            case 1:
                flags = this.id ? this.id(cpu) : {};
                Object.assign(flags, this.controlSignals);
                break;
            case 2:
                flags = this.ex ? this.ex(cpu) : {};
                break;
            case 3:
                flags = this.mem ? this.mem(cpu) : {};
                break;
            case 4:
                flags = this.wb ? this.web(cpu) : {};
                break;
            default:
                throw 'Instruction execution complete, no more cycles to tick.';
        }

        return {
            instructionComplete: this.cycle >= 4,
            flags: flags
        }
    }
};