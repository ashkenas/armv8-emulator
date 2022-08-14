import { useEffect, useRef, useState } from "react";
import styles from "@styles/Datapath.module.css";
import ScrollContent from "./scrollContent";
import { useSelector } from "react-redux";
import PopUp from "./popUp";
import SeqDatapath from "@util/seqdatapath.svg";

const baseToLetter = (base) => {
    switch (base) {
        case 2:
            return 'B';
        case 10:
            return 'D';
        case 16:
            return 'H';
        default:
            return base;
    }
}

const nameMap = {
    "ReadReg2": {
        internalName: "readReg2",
        base: 2,
        length: 5
    },
    "Instr": {
        internalName: "lineText"
    },
    "RegData1": {
        internalName: "readData1",
        base: 10
    },
    "RegData2": {
        internalName: "readData2",
        base: 10
    },
    "inputB": {
        internalName: "aluInputB",
        base: 10
    },
    "opcode": {
        internalName: "opcode",
        base: 2,
        length: 11
    },
    "Rd": {
        internalName: "rd",
        base: 2,
        length: 5
    },
    "imm": {
        internalName: "aluImm",
        base: 10
    },
    "Rt": {
        internalName: "rt",
        base: 2,
        length: 5
    },
    "Rm": {
        internalName: "rm",
        base: 2,
        length: 5
    },
    "Rn": {
        internalName: "readReg1",
        base: 2,
        length: 5
    },
    "ALUout": {
        internalName: "aluResult",
        base: 10
    },
    "PC": {
        internalName: "pc",
        base: 16
    },
    "ALUop": {
        internalName: "aluOp",
        base: 2,
        length: 2
    },
    "RegWrite": {
        internalName: "regWrite",
        base: 2
    },
    "ALUsrc": {
        internalName: "aluSrc",
        base: 2
    },
    "MemRead": {
        internalName: "memRead",
        base: 2
    },
    "MemWrite": {
        internalName: "memWrite",
        base: 2
    },
    "action": {
        internalName: "aluAction",
        base: 2,
        length: 4
    },
    "MemToReg": {
        internalName: "memToReg",
        base: 2
    },
    "LinkReg": {
        internalName: "linkReg",
        base: 2
    },
    "UBr": {
        internalName: "ubr",
        base: 2
    },
    "CBr": {
        internalName: "cbr",
        base: 2
    },
    "Zflag": {
        internalName: "z",
        base: 2
    },
    "CBR_Z": {
        internalName: "cbrZ",
        base: 2
    },
    "PC_imm": {
        internalName: "branchPC",
        base: 16
    },
    "PBr": {
        internalName: "pbr",
        base: 2
    },
    "Br": {
        internalName: "br",
        base: 2
    },
    "nextPC": {
        internalName: "nextPC",
        base: 16
    },
    "ReadDataM": {
        internalName: "readDataM",
        base: 10
    },
    "RegDataW": {
        internalName: "writeData",
        base: 10
    },
    "realPC": {
        internalName: "newPC",
        base: 16
    },
    "Reg2Loc": {
        internalName: "reg2Loc",
        base: 2
    }
};

function Datapath() {
    const ref = useRef(null);
    const values = useSelector((state) => state.wires);
    const newWires = useSelector((state) => state.newWires);
    const [hoverWire, setHoverWire] = useState(false);
    const [rect, setRect] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (!(ref && ref.current))
            return;

        for (const path in nameMap) {
            const components = ref.current.querySelectorAll(`[id="${path}"], [id^="${path}-"]`);
            for (const wireSegment of components) {
                if (newWires.includes(nameMap[path].internalName)) {
                    wireSegment.style.stroke = '#FF0000';
                    if (window.getComputedStyle(wireSegment).fill !== 'none')
                        wireSegment.style.fill = '#FF0000';
                } else {
                    wireSegment.style.stroke = '';
                    wireSegment.style.fill = '';
                }

                wireSegment.onmouseover = (event) => {
                    setHoverWire(event.target.id.split('-')[0]);
                    setRect({ left: event.clientX, top: event.clientY });
                };

                wireSegment.onmouseleave = (event) => {
                    setHoverWire(false);
                };
            }
        }
    }, [ref, ref.current, newWires]);

    return (
        <>
            <PopUp title={hoverWire} display={hoverWire} rect={rect}>
                {hoverWire && (values[nameMap[hoverWire].internalName] || 0).toString(nameMap[hoverWire].base).padStart(nameMap[hoverWire].length || 0, '0')}
                <sub>{hoverWire && baseToLetter(nameMap[hoverWire].base)}</sub>
            </PopUp>
            <ScrollContent>
                <SeqDatapath ref={ref} className={styles.datapath} />
            </ScrollContent>
        </>
    );
}

export default Datapath;
