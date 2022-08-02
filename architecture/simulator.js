import React, { useEffect, useState } from "react";
import Head from "next/head";
import {
    Code,
    Encoding,
    Registers,
    Memory,
    Datapath,
    ControlSignals
} from "@components/index"
import styles from "@styles/Home.module.css";
import { merge, reset, updateRegister } from "@util/reduxUtils";
import { initializeMemory, MAX_ADDRESS } from "@util/memoryUtils";
import { useDispatch, useSelector } from "react-redux";
import Parse from "./parse";

export default function Simulator(props) {
    const text = useSelector((state) => state.text);
    const dispatch = useDispatch();
    const [program, setProgram] = useState(null);
    const [run, setRun] = useState(false);
    const [parsingError, setParsingError] = useState(false);
    const [runtimeError, setRuntimeError] = useState(false);
    const [restart, setRestart] = useState(0);

    if (runtimeError)
        throw runtimeError;

    useEffect(() => {
        if (!program)
            return;

        dispatch(reset());
        initializeMemory(program);
        dispatch(updateRegister(28, BigInt(MAX_ADDRESS + 1)));
        dispatch(updateRegister(29, BigInt(MAX_ADDRESS + 1)));
        dispatch(merge({
            instructions: program.instructions.map((instruction) => instruction.lineText),
            encoding: program.instructions[program.currentInstruction].encodingParts,
            lineNumber: program.instructions[program.currentInstruction].lineNumber,
            lastRegister: -1
        }));
    }, [program]);

    useEffect(() => {
        try {
            const p = new Parse(text);
            setProgram(p.program);
            setParsingError(false);
        } catch (e) {
            setParsingError(e);
        }
    }, [text, restart]);

    const syncError = (func) => (...args) => {
        try {
            func(...args);
        } catch (e) {
            setRuntimeError(e);
        }
    };

    const buttons = [
        {
            text: 'Next Cycle',
            effect: syncError(() => {
                program.tick();
            })
        },
        {
            text: 'Next Instruction',
            effect: syncError(() => {
                if (!program.tick())
                    while(program.instructions[program.currentInstruction]?.cycle)
                        program.tick();
            })
        },
        {
            text: 'Restart',
            effect: syncError(() => {
                setRestart(++restart);
            })
        },
        {
            text: run ? 'Pause' : 'Play',
            effect: syncError(() => {
                if (run) {
                    clearInterval(run);
                    setRun(false);
                } else {
                    setRun(setInterval(() => {
                        if (program.tick()) {
                            clearTimeout(run);
                            setRun(false);
                        }
                    }, 100));
                }
            })
        },
        {
            text: 'Run to End',
            effect: syncError(() => {
                while(!program.tick());
            })
        }
    ];

    return (
        <div className={styles.container}>
            <Head>
                <title>ARMv8 Emulator</title>
                <meta name="description" content="Emulates ARMv8 Programs" />
            </Head>

            <div className={styles.column}>
                <div className={`${styles.card} ${styles.expand}`}>
                    <Code error={parsingError} />
                    {buttons.map(({ text, effect }) => <button key={text} className={styles.button} onClick={effect}>{text}</button>)}
                </div>

                <div className={styles.card}>
                    <h2>Encoding</h2>
                    <Encoding />
                </div>
            </div>

            <div className={styles.column}>
                <div className={styles.row}>
                    <div className={`${styles.card} ${styles.fix}`}>
                        <Registers />
                    </div>

                    <div className={styles.card}>
                        <ControlSignals />
                    </div>
                </div>

                <div className={`${styles.card} ${styles.expand}`}>
                    <Memory />
                </div>
            </div>

            <div className={`${styles.column} ${styles.expand}`}>
                <div className={styles.card}>
                    <Datapath />
                </div>
            </div>
        </div>
    );
};