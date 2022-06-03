export default class Instruction {
    constructor() {
        this.cycle = 0;
    }

    tick(cpu) {
        this.cycle++;
        switch(this.cycle) {
            case 1:
                return this.if ? this.if(cpu) : {};
            case 2:
                return this.id ? this.id(cpu) : {};
            case 3:
                return this.ex ? this.ex(cpu) : {};
            case 4:
                return this.mem ? this.mem(cpu) : {};
            case 5:
                return this.wb ? this.web(cpu) : {};
            default:
                throw 'Instruction execution complete, no more cycles to tick.';
        }
    }
};