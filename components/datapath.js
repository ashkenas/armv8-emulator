import { useEffect, useRef } from "react";
import styles from "@styles/Datapath.module.css";
import ScrollContent from "./scrollContent";
import { useSelector } from "react-redux";

const nameMap = {
    "ALU": "ALU",
    "MUX": "MUX",
    "readReg2": "ReadReg2",
    "Instr": "Instr",
    "readData1": "RegData1",
    "readData2": "RegData2",
    "inputB": "inputB",
    "opcode": "opcode",
    "Rd": "Rd",
    "imm": "imm",
    "Rt": "Rt",
    "Rm": "Rm",
    "readReg1": "Rn",
    "aluResult": "ALUout",
    "Adder": "Adder",
    "pc": "PC",
    "aluOp": "ALUop",
    "regWrite": "RegWrite",
    "aluSrc": "ALUsrc",
    "memRead": "MemRead",
    "memWrite": "MemWrite",
    "aluAction": "action",
    "ANDGate": "ANDGate",
    "ORGate": "ORGate",
    "memToReg": "MemToReg",
    "linkReg": "LinkReg",
    "ubr": "UBr",
    "cbr": "CBr",
    "z": "Zflag",
    "CBR_Z": "CBR_Z",
    "PC_imm": "PC_imm",
    "pbr": "PBr",
    "branchPc": "Br",
    "nextPC": "nextPC",
    "ReadDataM": "ReadDataM",
    "writeData": "RegDataW",
    "fourbytes": "fourbytes",
    "newPC": "realPC",
    "reg2Loc": "Reg2Loc"
};

function Datapath() {
    const ref = useRef(null);
    const values = useSelector((state) => state.wires);

    useEffect(() => {
        if (!(ref && ref.current))
            return;

        const root = ref.current.getSVGDocument();
    }, [ref, ref.current]);

    return (
        <ScrollContent>
            <object ref={ref} className={styles.datapath} type="image/svg+xml" data="/svg/seqdatapath.svg" />
        </ScrollContent>
    );
}

export default Datapath;
