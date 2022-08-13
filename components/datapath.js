import { useEffect, useRef, useState } from "react";
import styles from "@styles/Datapath.module.css";
import ScrollContent from "./scrollContent";
import { useSelector } from "react-redux";
import PopUp from "./popUp";
import SeqDatapath from "@util/seqdatapath.svg";

const nameMap = {
    "ReadReg2": "readReg2",
    "Instr": "encoding",
    "RegData1": "readData1",
    "RegData2": "readData2",
    "inputB": "aluInputB",
    "opcode": "opcode",
    "Rd": "rd",
    "imm": "aluImm",
    "Rt": "rt",
    "Rm": "rm",
    "Rn": "readReg1",
    "ALUout": "aluResult",
    "PC": "pc",
    "ALUop": "aluOp",
    "RegWrite": "regWrite",
    "ALUsrc": "aluSrc",
    "MemRead": "memRead",
    "MemWrite": "memWrite",
    "action": "aluAction",
    "MemToReg": "memToReg",
    "LinkReg": "linkReg",
    "UBr": "ubr",
    "CBr": "cbr",
    "Zflag": "z",
    "CBR_Z": "cbrZ",
    "PC_imm": "branchPC",
    "PBr": "pbr",
    "Br": "br",
    "nextPC": "nextPC",
    "ReadDataM": "readDataM",
    "RegDataW": "writeData",
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
