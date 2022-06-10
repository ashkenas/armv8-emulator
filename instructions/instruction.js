export default class Instruction {
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

    constructor() {
        this.cycle = 0;
    }

    setControlSignals(...signals) {
        this.controlSignals = {};
        for(let i = 0; i < signals.length; i++) {
            if (signals[i] !== null)
                this.controlSignals[_controlSignalNames[i]] = signals[i];
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