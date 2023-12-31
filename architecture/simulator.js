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
import { themeDark, themeLight } from "@util/themes";
import ErrorBoundary from "@components/errorBoundary";

export default function Simulator(props) {
    const text = useSelector((state) => state.text);
    const dispatch = useDispatch();
    const [program, setProgram] = useState(null);
    const [run, setRun] = useState(false);
    const [fastForward, setFastFoward] = useState(false);
    const [parsingError, setParsingError] = useState(false);
    const [runtimeError, setRuntimeError] = useState(false);
    const [inspectMode, setInspectMode] = useState(false);
    const [restart, setRestart] = useState(0);
    const [lightMode, setLightMode] = useState(true);

    // if (runtimeError)
    //     throw runtimeError;

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
            setProgram(Parse(text));
            setParsingError(false);
        } catch (e) {
            setParsingError(e);
        }
    }, [text, restart]);

    useEffect(() => {
        const theme = (lightMode ? themeLight : themeDark);
        for (const cssVar in theme)
            document.documentElement.style.setProperty(cssVar, theme[cssVar]);
    }, [lightMode])

    const syncError = (func) => (...args) => {
        try {
            func(...args);
        } catch (e) {
            setRuntimeError(e);
        }
    };

    const restartFunc = syncError(() => {
        if (run) {
            clearInterval(run);
            setRun(false);
            setFastFoward(false);
        }
        setRestart(restart + 1);
        setRuntimeError(false);
        setInspectMode(false);
    });

    const inspectFunc = () => {
        setInspectMode(true);
        setRuntimeError(false);
    };

    const buttons = [
        {
            text: <span className="material-symbols-outlined">pause</span>,
            title: 'Pause Execution',
            disabled: inspectMode,
            effect : syncError(() => {
                if (run) {
                    clearInterval(run);
                    setRun(false);
                    setFastFoward(false);
                }
            })
        },
        {
            text: <span className="material-symbols-outlined">auto_mode</span>,
            title: (fastForward === true || run === false) ? 'Start Execution' : 'Speed Up',
            disabled: inspectMode,
            effect: syncError(() => {
                if (run) {
                    clearInterval(run);
                    setFastFoward(!fastForward);
                }

                setRun(setInterval(syncError(() => {
                    if (program.tick()) {
                        clearInterval(run);
                        setRun(false);
                    }
                }), 100 / ((run && !fastForward) ? 2 : 1)));
            })
        },
        {
            text: <span className="material-symbols-outlined">keyboard_arrow_right</span>,
            title: 'Execute Next Stage',
            disabled: inspectMode,
            effect: syncError(() => {
                program.tick();
            })
        },
        {
            text: <span className="material-symbols-outlined">keyboard_double_arrow_right</span>,
            title: 'Execute Next Instruction',
            disabled: inspectMode,
            effect: syncError(() => {
                if (!program.tick())
                    while(program.instructions[program.currentInstruction]?.cycle)
                        program.tick();
            })
        },
        {
            text: <span className="material-symbols-outlined">last_page</span>,
            title: 'Execute All',
            disabled: inspectMode,
            effect: syncError(() => {
                while(!program.tick());
            })
        },
        {
            text: <span className="material-symbols-outlined">replay</span>,
            title: 'Restart',
            disabled: false,
            effect: restartFunc
        }
    ];

    return (
        <ErrorBoundary title={"Runtime Error"} error={runtimeError} restart={restartFunc} inspect={inspectFunc}>
            <Head>
                <title>ARMv8 Emulator</title>
                <meta name="description" content="Emulates ARMv8 Programs" />
            </Head>

            <div className={styles.navbar}>
                <div onClick={() => setLightMode(!lightMode)}>
                    {lightMode ? 'Dark Mode' : 'Light Mode'}
                    {/* <span className="material-symbols-outlined">{lightMode ? 'dark' : 'light'}_mode</span> */}
                </div>
            </div>

            <div className={styles.container}>
                <div className={styles.column}>
                    <div className={`${styles.card} ${styles.expand}`}>
                        <Code error={parsingError} theme={lightMode ? 'light' : 'dark'} />
                        <div className={styles.row}>
                            {buttons.map(({ text, title, disabled, effect }, i) =>
                                <button key={i} className={styles.button} onClick={effect} title={title} disabled={disabled}>{text}</button>
                            )}
                        </div>
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
        </ErrorBoundary>
    );
};