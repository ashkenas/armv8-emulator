export class ArgumentType {
    /* Maximum binary digits present in an ArgumentType value */
    static typeLength = 1;

    static Register = 0b1;
    static Immediate = 0b0;
}

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
        this.encodingParts = [];
        this.encoding = BigInt(this.opcode) << 21n;
        this.encodingParts.push({
            type: 'opcode',
            value: this.opcode,
            length: 11,
            tooltip: 'Op-code'
        });

        if (this.rm !== undefined) {
            this.encoding += BigInt(this.rm) << 15n;
            this.encodingParts.push({
                type: 'register',
                value: this.rm,
                length: 5,
                tooltip: 'Rm'
            });
        } else if (this.imm11 === undefined) {
            this.encodingParts.push({
                type: 'none',
                value: 0,
                length: 11,
                tooltip: 'Insignificant'
            });
        }

        if (this.imm11 !== undefined) {
            this.encoding += this.imm11 << 10n;
            this.encodingParts.push({
                type: 'immediate',
                value: Number(this.imm11),
                length: 11,
                tooltip: 'Immediate'
            });
        } else if (this.rm !== undefined) {
            this.encodingParts.push({
                type: 'none',
                value: 0,
                length: 6,
                tooltip: 'Insignificant'
            });
        }
        
        if (this.rn !== undefined) {
            this.encoding += BigInt(this.rn) << 5n;
            this.encodingParts.push({
                type: 'register',
                value: this.rn,
                length: 5,
                tooltip: 'Rn'
            });
        } else {
            this.encodingParts.push({
                type: 'none',
                value: 0,
                length: 5,
                tooltip: 'Insignificant'
            });
        }

        if (this.rd !== undefined) {
            this.encoding += BigInt(this.rd);
            this.encodingParts.push({
                type: 'register',
                value: this.rd,
                length: 5,
                tooltip: 'Rd'
            });
        } else if (this.rt !== undefined) {
            this.encoding += BigInt(this.rt);
            this.encodingParts.push({
                type: 'register',
                value: this.rt,
                length: 5,
                tooltip: 'Rt'
            });
        } else {
            this.encodingParts.push({
                type: 'none',
                value: 0,
                length: 5,
                tooltip: 'Insignificant'
            });
        }
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
                    flags.newPC = Number(this.aluResult);
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
}