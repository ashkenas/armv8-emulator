import { useEffect, useRef, useState } from "react";
import styles from "@styles/Datapath.module.css";
import ScrollContent from "./scrollContent";
import { useSelector } from "react-redux";
import PopUp from "./popUp";
import SeqDatapath from "@util/seqdatapath.svg";

const nameMap = {
    "ALU": "ALU",
    "MUX": "MUX",
    "ReadReg2": "readReg2",
    "Instr": "Instr",
    "RegData1": "readData1",
    "RegData2": "readData2",
    "inputB": "inputB",
    "opcode": "opcode",
    "Rd": "Rd",
    "imm": "aluImm",
    "Rt": "Rt",
    "Rm": "Rm",
    "Rn": "readReg1",
    "ALUout": "aluResult",
    "Adder": "Adder",
    "PC": "pc",
    "ALUop": "aluOp",
    "RegWrite": "regWrite",
    "ALUsrc": "aluSrc",
    "MemRead": "memRead",
    "MemWrite": "memWrite",
    "action": "aluAction",
    "ANDGate": "ANDGate",
    "ORGate": "ORGate",
    "MemToReg": "memToReg",
    "LinkReg": "linkReg",
    "UBr": "ubr",
    "CBr": "cbr",
    "Zflag": "z",
    "CBR_Z": "CBR_Z",
    "PC_imm": "PC_imm",
    "PBr": "pbr",
    "Br": "branchPc",
    "nextPC": "nextPC",
    "ReadDataM": "ReadDataM",
    "RegDataW": "writeData",
    "fourbytes": "fourbytes",
    "realPC": "newPC",
    "Reg2Loc": "reg2Loc"
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

        const root = ref.current;
        for (const path in nameMap) {
            const components = root.querySelectorAll(`[id="${path}"], [id^="${path}-"]`);
            for (const wireSegment of components) {
                if (newWires.includes(nameMap[path]))
                    wireSegment.style.stroke = '#FF0000';
                else
                    wireSegment.style.stroke = '';
            }
        }
    }, [ref, ref.current, newWires]);

    return (
        <>
            <PopUp title={hoverWire} display={hoverWire} rect>
                {values[hoverWire]}
            </PopUp>
            <ScrollContent>
                <SeqDatapath ref={ref} className={styles.datapath} data-wires={values} />
            </ScrollContent>
        </>
    );
}

export default Datapath;
