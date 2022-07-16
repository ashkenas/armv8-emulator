import React from "react";
import MemoryStructure from "../util/memoryStructure";
import RegisterStructure from "../util/registerStructure";
import Code from "../components/code";
import Encoding from "../components/encoding";
import Registers from "../components/registers";
import Memory from "../components/memory";
import Datapath from "../components/datapath";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Program from "./program";
import ADDIInstruction from "../instructions/addi";
import ADDInstruction from "../instructions/add";
import SUBInstruction from "../instructions/sub";
import ADRInstruction from "../instructions/adr";
import CBZInstruction from "../instructions/cbz";
import BInstruction from "../instructions/b";
import LDURInstruction from "../instructions/ldur";
import NOPInstruction from "../instructions/nop";
import { bigIntArrayToBigInt } from "../util/formatUtils";
import ControlSignals from "../components/controlSignals";

export default class Simulator extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lineNumber: 0,
            registers: [],
            memory: {
                text: null,
                stack: null,
                frames: []
            },
            wires: {},
            encoding: null,
            controlSignals: null
        }

        this.registers = new RegisterStructure(this);
    }
    // Temporary demo code, function will be removed later
    componentDidMount() {
        const p = new Program();
        p.addInstruction(ADDIInstruction, [0, 31, 0n], 3);
        p.addInstruction(ADRInstruction, [1, 'array'], 4);
        p.addInstruction(ADDIInstruction, [2, 31, 0n], 5);
        p.addInstruction(ADRInstruction, [3, 'length'], 6);
        p.addInstruction(LDURInstruction, [3, 3, 0n], 7);
        p.addLabel('loop');
        p.addInstruction(SUBInstruction, [5, 3, 0], 9);
        p.addInstruction(CBZInstruction, [5, 'loop_end'], 10);
        p.addInstruction(LDURInstruction, [6, 1, 0n], 11);
        p.addInstruction(ADDInstruction, [2, 2, 6], 12);
        p.addInstruction(ADDIInstruction, [0, 0, 1n], 13);
        p.addInstruction(ADDIInstruction, [1, 1, 8n], 14);
        p.addInstruction(BInstruction, ['loop'], 15);
        p.addLabel('loop_end');
        p.addInstruction(NOPInstruction, [], 17);
        p.addInitializedData('array', bigIntArrayToBigInt([7n, 5n, 4n, 8n, 2n, 9n, 1n, 3n, 10n, 6n]), 8 * 10);
        p.addInitializedData('length', 10n, 8);
        p.runSubstitutions();
        this.load(p);
    }

    load(program) {
        this.program = program;
        this.memory = new MemoryStructure(program, this);
        this.registers = new RegisterStructure(this);
        this.setState({
            encoding: this.program.instructions[this.program.currentInstruction].encodingParts,
            lineNumber: this.program.instructions[this.program.currentInstruction].lineNumber
        });
    }

    tick() {
        if (!this.program)
            throw 'No program loaded!';

        if (this.program.tick(this))
            this.program = null;
    }

    render() {
        return (
            <div className={styles.container}>
                <Head>
                    <title>ARMv8 Emulator</title>
                    <meta name="description" content="Emulates ARMv8 Programs" />
                </Head>

                <div className={styles.column}>
                    <div className={`${styles.card} ${styles.expand}`}>
                        <h2>Code</h2>
                        <Code lineNumber={this.state.lineNumber} />
                        {/* Demo buttons, will be removed later */}
                        <button className={styles.btest} onClick={() => { this.program?.tick(this); }}>Next Cycle</button>
                        <button className={styles.btest} onClick={() => { for(let i = 0; i < 5; i++)this.program?.tick(this); }}>Next 5 Cycles</button>
                    </div>

                    <div className={styles.card}>
                        <h2>Encoding</h2>
                        <Encoding parts={this.state.encoding} />
                    </div>
                </div>

                <div className={styles.column}>
                    <div className={styles.card}>
                        <h2>Registers</h2>
                        <Registers values={this.state.registers} />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.card}>
                            <h2>Control Signals</h2>
                            <ControlSignals signals={this.state.controlSignals} />
                        </div>

                        <div className={`${styles.card} ${styles.expand}`}>
                            <h2>Memory</h2>
                            <Memory memory={this.state.memory} />
                        </div>
                    </div>
                </div>

                <div className={styles.column} style={{ flexGrow: 2 }}>
                    <div className={styles.card}>
                        <h2>Datapath</h2>
                        <Datapath wires={this.state.wires} />
                    </div>
                </div>
            </div>
        );
    }
};