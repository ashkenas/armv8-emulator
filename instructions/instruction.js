import { faGlassCheers } from "@fortawesome/free-solid-svg-icons";

export class ArgumentType {
    /* Maximum binary digits present in an ArgumentType value */
    static typeLength = 1;

    static Register = 0b1;
    static Immediate = 0b0;

    static toString(argType) {
        switch(argType) {
            case ArgumentType.Register:
                return 'Register';
            case ArgumentType.Immediate:
                return 'Immediate';
            default:
                return 'Unknown';
        }
    }
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
        'regWrite'
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
            tooltip: 'Op-Code'
        });

        if (this.rm !== undefined) {
            this.encoding += BigInt(this.rm) << 15n;
            this.encodingParts.push({
                type: 'register',
                value: this.rm,
                length: 5,
                tooltip: `Rm (X${this.rm})`
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
                tooltip: `Rn (X${this.rn})`
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
                tooltip: `Rd (X${this.rd})`
            });
        } else if (this.rt !== undefined) {
            this.encoding += BigInt(this.rt);
            this.encodingParts.push({
                type: 'register',
                value: this.rt,
                length: 5,
                tooltip: `Rt (X${this.rt})`
            });
        } else {
            this.encodingParts.push({
                type: 'none',
                value: 0,
                length: 5,
                tooltip: 'Insignificant'
            });
        }

        this.encoding = Number(this.encoding);
    }

    setControlSignals(...signals) {
        this.controlSignals = {};
        for(let i = 0; i < signals.length; i++) {
            if (signals[i] !== null)
                this.controlSignals[Instruction._controlSignalNames[i]] = signals[i];
        }
    }

    tick(program) {
        let flags = {};

        switch(this.cycle++) {
            case 0:
                flags = this.if ? this.if(program) : {};

                flags.pc = program.currentInstruction * 4;
                this.nextPC = (flags.pc) + 4;
                flags.nextPC = this.nextPC;
                flags.encoding = this.encoding;
                flags.opcode = this.opcode;
                flags.rm = (flags.encoding >> 16) & 0b11111;
                flags.rt = flags.encoding & 0b11111;
                flags.rd = flags.encoding & 0b11111;

                break;
            case 1:
                flags = this.id ? this.id(program) : {};

                if (flags.readData2)
                    this.readData2 = flags.readData2;

                Object.assign(flags, this.controlSignals);

                break;
            case 2:
                flags = this.ex ? this.ex(program) : {};

                flags.aluInputB = this.controlSignals.aluSrc ? this.imm11 : this.readData2;

                if (flags.aluAction)
                    flags.z = flags.aluResult == 0 ? 1 : 0;

                flags.cbrZ = this.controlSignals.cbr & flags.z;
                flags.br = this.controlSignals.ubr || flags.cbrZ;

                if (this.controlSignals.pbr)
                    flags.newPC = Number(this.aluResult);
                else
                    flags.newPC = flags.br ? flags.branchPC : this.nextPC;
                
                break;
            case 3:
                flags = this.mem ? this.mem(program) : {};
                break;
            case 4:
                flags = this.wb ? this.wb(program) : {};
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