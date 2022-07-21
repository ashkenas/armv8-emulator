import React from "react";
import Head from "next/head";
import {
    Code,
    Encoding,
    Registers,
    Memory,
    Datapath,
    ControlSignals
} from "@components/index"
import {
    MemoryStructure,
    RegisterStructure,
} from "@util/index"
import styles from "@styles/Home.module.css";
import ErrorBoundary from "@components/errorBoundary";

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
    }

    load(program) {
        this.program = program;
        this.memory = new MemoryStructure(program, this);
        this.registers = new RegisterStructure(this);
        this.setState({
            lineNumber: this.program.instructions[this.program.currentInstruction].lineNumber,
            wires: {},
            controlSignals: null,
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
                        <ErrorBoundary title={"Parsing Error"}>
                            <Code simulator={this} lineNumber={this.state.lineNumber} />
                        </ErrorBoundary>
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
                            <Memory stackPointer={this.state.registers[28]} memory={this.state.memory} />
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