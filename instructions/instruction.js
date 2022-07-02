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
        this.encoding = BigInt(this.opcode) << 21n;

        if (this.rm)
            this.encoding += BigInt(this.rm) << 15n;
        
        if (this.rn)
            this.encoding += BigInt(this.rn) << 5n;
        
        if (this.rd)
            this.encoding += BigInt(this.rd);
        
        if (this.rt)
            this.encoding += BigInt(this.rt);
        
        if (this.imm11)
            this.encoding += this.imm11 << 10n;
    }

    setControlSignals(...signals) {
        this.controlSignals = {};
        for(let i = 0; i < signals.length; i++) {
            if (signals[i] !== null)
                this.controlSignals[Instruction._controlSignalNames[i]] = signals[i];
        }
    }

    tick(simulator) {
        let flags = {};

        switch(this.cycle++) {
            case 0:
                flags = this.if ? this.if(simulator) : {};

                this.nextPC = (simulator.program.currentInstruction * 4) + 4;
                flags.nextPC = this.nextPC;

                break;
            case 1:
                flags = this.id ? this.id(simulator) : {};

                if (flags.readData2)
                    this.readData2 = flags.readData2;

                Object.assign(flags, this.controlSignals);

                break;
            case 2:
                flags = this.ex ? this.ex(simulator) : {};

                flags.aluInputB = this.controlSignals.aluSrc ? this.imm11 : this.readData2;

                if (flags.aluAction)
                    flags.z = flags.aluResult == 0;

                if (this.controlSignals.pbr)
                    flags.newPC = this.aluResult
                else
                    flags.newPC = (this.controlSignals.ubr || (this.controlSignals.cbr && flags.z)) ? flags.branchPC : this.nextPC;
                
                break;
            case 3:
                flags = this.mem ? this.mem(simulator) : {};
                break;
            case 4:
                flags = this.wb ? this.wb(simulator) : {};
                break;
            default:
                throw 'Instruction execution complete, no more cycles to tick.';
        }

        const complete = this.cycle === 5;
        if (complete)
            this.cycle = 0;

        return {
            instructionComplete: complete,
            flags: flags
        };
    }
};