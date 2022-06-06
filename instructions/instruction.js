export default class Instruction {
    constructor() {
        this.cycle = 0;
    }

    tick(cpu) {
        let flags = {};

        switch(this.cycle++) {
            case 0:
                flags = this.if ? this.if(cpu) : {};
                break;
            case 1:
                flags = this.id ? this.id(cpu) : {};
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
                throw 'Instruction execution complete, no more cycles to tick.';0
        }

        return {
            instructionComplete: this.cycle >= 4,
            flags: flags
        }
    }
};