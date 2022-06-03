import ArgumentType from './argumentType';
import ADDIInstruction from './addi';

export default class InstructionRegistry {
    static registry = {};

    /** Used by instruction types to self-register */
    static register(mnemonic, syntax, type) {
        if (!(mnemonic in this.registry))
            this.registry[mnemonic] = {};
        
        const serialSyntax = this.serializeSyntax(syntax);
        if (serialSyntax in this.registry[mnemonic])
            throw `'${type.name}' has the same mnemonic and syntax as already registered instruction '${this.registry[mnemonic][serialSyntax].name}`;

        this.registry[mnemonic][serialSyntax] = type;
    }

    /** Converts an array of ArgumentType into a
     *  serial integer to use as a key.
     */
    static serializeSyntax(syntax) {
        let serialSyntax = syntax[0];
        for (let i = 1; i < syntax.length; i++)
            serialSyntax = (serialSyntax << ArgumentType.typeLength) + syntax[i];
        return serialSyntax;
    }

    /** Returns the Instruction object matching
     *  the mnemonic and syntax provided.
     */
    static match(mnemonic, syntax) {
        const serialSyntax = this.serializeSyntax(syntax);

        if(mnemonic in this.registry)
            return this.registry[mnemonic][serialSyntax]
        else
            return undefined;
    }
};