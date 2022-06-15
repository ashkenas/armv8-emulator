# ARM-LIVE - a really dope ARM visualizer
Coming soon...

## Building and running [development only]
### First time setup
Run `npm install` in the project root directory to install necessary dependencies.
### Starting the simulator
Run `npm run dev` to host the simulation at http://localhost:3000/. Refreshes as code changes.

## Supported instructions
* `AND Rd, Rn, Rm`
* `ANDS Rd, Rn, Rm`
* `ORR Rd, Rn, Rm`
* `ORR Rd, Rn, Imm11`
* `ADD Rd, Rn, Rm`
* `ADD Rd, Rn, Imm11`
* `ADDS Rd, Rn, Rm`
* `ADDS Rd, Rn, Imm11`
* `SUB Rd, Rn, Rm`
* `SUB Rd, Rn, Imm11`
* `SUBS Rd, Rn, Rm`
* `SUBS Rd, Rn, Imm11`
* `LDUR Rt, [Rn, Imm11]`
* `STUR Rt, [Rn, Imm11]`
* `B Label`
* `BL Label`
* `CBZ Rt, Label`
* `RET`