import { useRef } from "react";
import styles from "@styles/Datapath.module.css";
import ScrollContent from "./scrollContent";
// import React from "react";
// import * as go from "gojs";
// import { ReactDiagram } from "gojs-react";
// For gate symbols
// import _ from "gojs/extensions/Figures";


// const red = "orangered"; // 0 or false
// const green = "forestgreen"; // 1 or true

// Based on https://gojs.net/latest/samples/logicCircuit.html
// function initDiagram() {
//     const $ = go.GraphObject.make;
//     // set your license key here before creating the diagram: go.Diagram.licenseKey = "...";
//     const diagram = $(go.Diagram, {
//         "undoManager.isEnabled": true, // must be set to allow for model change listening
//         // 'undoManager.maxHistoryLength': 0,  // uncomment disable undo/redo functionality
//         "clickCreatingTool.archetypeNodeData": {
//             text: "new node",
//             color: "lightblue",
//         },
//         model: new go.GraphLinksModel({
//             linkKeyProperty: "key", // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
//         }),
//     });

//     // define a simple Node template
//     diagram.nodeTemplate = $(
//         go.Node,
//         "Auto", // the Shape will go around the TextBlock
//         new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
//             go.Point.stringify
//         ),
//         $(
//             go.Shape,
//             "RoundedRectangle",
//             { name: "SHAPE", fill: "white", strokeWidth: 0 },
//             // Shape.fill is bound to Node.data.color
//             new go.Binding("fill", "color")
//         ),
//         $(
//             go.TextBlock,
//             { margin: 8, editable: true }, // some room around the text
//             new go.Binding("text").makeTwoWay()
//         )
//     );

//     diagram.linkTemplate = $(
//         go.Link,
//         {
//             routing: go.Link.AvoidsNodes,
//             curve: go.Link.JumpOver,
//             corner: 3,
//             relinkableFrom: true,
//             relinkableTo: true,
//             selectionAdorned: false, // Links are not adorned when selected so that their color remains visible.
//             shadowOffset: new go.Point(0, 0),
//             shadowBlur: 5,
//             shadowColor: "blue",
//         },
//         new go.Binding("isShadowed", "isSelected").ofObject(),
//         $(go.Shape, { name: "SHAPE", strokeWidth: 2, stroke: red })
//     );

//     function nodeStyle() {
//         return [
//             new go.Binding("location", "loc", go.Point.parse).makeTwoWay(
//                 go.Point.stringify
//             ),
//             new go.Binding("isShadowed", "isSelected").ofObject(),
//             {
//                 selectionAdorned: false,
//                 shadowOffset: new go.Point(0, 0),
//                 shadowBlur: 15,
//                 shadowColor: "blue",
//             },
//         ];
//     }

//     function shapeStyle() {
//         return {
//             name: "NODESHAPE",
//             fill: "lightgray",
//             stroke: "darkslategray",
//             desiredSize: new go.Size(40, 40),
//             strokeWidth: 2,
//         };
//     }

//     function portStyle(input) {
//         return {
//             desiredSize: new go.Size(6, 6),
//             fill: "black",
//             fromSpot: go.Spot.Right,
//             fromLinkable: !input,
//             toSpot: go.Spot.Left,
//             toLinkable: input,
//             toMaxLinks: 1,
//             cursor: "pointer",
//         };
//     }

//     // define templates for each type of node
//     const inputTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "Circle", shapeStyle(), { fill: red }), // override the default fill (from shapeStyle()) to be red
//         $(
//             go.Shape,
//             "Rectangle",
//             portStyle(false), // the only port
//             { portId: "", alignment: new go.Spot(1, 0.5) }
//         ),
//         {
//             // if double-clicked, an input node will change its value, represented by the color.
//             doubleClick: (e, obj) => {
//                 e.diagram.startTransaction("Toggle Input");
//                 const shp = obj.findObject("NODESHAPE");
//                 shp.fill = shp.fill === green ? red : green;
//                 updateStates();
//                 e.diagram.commitTransaction("Toggle Input");
//             },
//         }
//     );

//     const outputTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "Rectangle", shapeStyle(), { fill: green }), // override the default fill (from shapeStyle()) to be green
//         $(
//             go.Shape,
//             "Rectangle",
//             portStyle(true), // the only port
//             { portId: "", alignment: new go.Spot(0, 0.5) }
//         )
//     );

//     const andTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "AndGate", shapeStyle()),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in1",
//             alignment: new go.Spot(0, 0.3),
//         }),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in2",
//             alignment: new go.Spot(0, 0.7),
//         }),
//         $(go.Shape, "Rectangle", portStyle(false), {
//             portId: "out",
//             alignment: new go.Spot(1, 0.5),
//         })
//     );

//     const orTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "OrGate", shapeStyle()),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in1",
//             alignment: new go.Spot(0.16, 0.3),
//         }),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in2",
//             alignment: new go.Spot(0.16, 0.7),
//         }),
//         $(go.Shape, "Rectangle", portStyle(false), {
//             portId: "out",
//             alignment: new go.Spot(1, 0.5),
//         })
//     );

//     const xorTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "XorGate", shapeStyle()),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in1",
//             alignment: new go.Spot(0.26, 0.3),
//         }),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in2",
//             alignment: new go.Spot(0.26, 0.7),
//         }),
//         $(go.Shape, "Rectangle", portStyle(false), {
//             portId: "out",
//             alignment: new go.Spot(1, 0.5),
//         })
//     );

//     const norTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "NorGate", shapeStyle()),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in1",
//             alignment: new go.Spot(0.16, 0.3),
//         }),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in2",
//             alignment: new go.Spot(0.16, 0.7),
//         }),
//         $(go.Shape, "Rectangle", portStyle(false), {
//             portId: "out",
//             alignment: new go.Spot(1, 0.5),
//         })
//     );

//     const xnorTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "XnorGate", shapeStyle()),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in1",
//             alignment: new go.Spot(0.26, 0.3),
//         }),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in2",
//             alignment: new go.Spot(0.26, 0.7),
//         }),
//         $(go.Shape, "Rectangle", portStyle(false), {
//             portId: "out",
//             alignment: new go.Spot(1, 0.5),
//         })
//     );

//     const nandTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "NandGate", shapeStyle()),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in1",
//             alignment: new go.Spot(0, 0.3),
//         }),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in2",
//             alignment: new go.Spot(0, 0.7),
//         }),
//         $(go.Shape, "Rectangle", portStyle(false), {
//             portId: "out",
//             alignment: new go.Spot(1, 0.5),
//         })
//     );

//     const notTemplate = $(
//         go.Node,
//         "Spot",
//         nodeStyle(),
//         $(go.Shape, "Inverter", shapeStyle()),
//         $(go.Shape, "Rectangle", portStyle(true), {
//             portId: "in",
//             alignment: new go.Spot(0, 0.5),
//         }),
//         $(go.Shape, "Rectangle", portStyle(false), {
//             portId: "out",
//             alignment: new go.Spot(1, 0.5),
//         })
//     );

//     diagram.nodeTemplateMap.add("input", inputTemplate);
//     diagram.nodeTemplateMap.add("output", outputTemplate);
//     diagram.nodeTemplateMap.add("and", andTemplate);
//     diagram.nodeTemplateMap.add("or", orTemplate);
//     diagram.nodeTemplateMap.add("xor", xorTemplate);
//     diagram.nodeTemplateMap.add("not", notTemplate);
//     diagram.nodeTemplateMap.add("nand", nandTemplate);
//     diagram.nodeTemplateMap.add("nor", norTemplate);
//     diagram.nodeTemplateMap.add("xnor", xnorTemplate);

//     return diagram;
// }

// function Datapath() {
//     return (
//         <div>
//             <ReactDiagram
//                 initDiagram={initDiagram}
//                 divClassName="diagram-component"
//                 class={go.GraphLinksModel}
//                 linkFromPortIdProperty="fromPort"
//                 linkToPortIdProperty="toPort"
//                 nodeDataArray={[
//                     { category: "input", key: "input1", loc: "-150 -80" },
//                     { category: "or", key: "or1", loc: "-70 0" },
//                     { category: "not", key: "not1", loc: "10 0" },
//                     { category: "xor", key: "xor1", loc: "100 0" },
//                     { category: "or", key: "or2", loc: "200 0" },
//                     { category: "output", key: "output1", loc: "200 -100" },
//                 ]}
//                 linkDataArray={[
//                     {
//                         from: "input1",
//                         fromPort: "out",
//                         to: "or1",
//                         toPort: "in1",
//                     },
//                     { from: "or1", fromPort: "out", to: "not1", toPort: "in" },
//                     { from: "not1", fromPort: "out", to: "or1", toPort: "in2" },
//                     {
//                         from: "not1",
//                         fromPort: "out",
//                         to: "xor1",
//                         toPort: "in1",
//                     },
//                     { from: "xor1", fromPort: "out", to: "or2", toPort: "in1" },
//                     { from: "or2", fromPort: "out", to: "xor1", toPort: "in2" },
//                     {
//                         from: "xor1",
//                         fromPort: "out",
//                         to: "output1",
//                         toPort: "",
//                     },
//                 ]}
//             />
//         </div>
//     );
// }

function Datapath() {
    const ref = useRef(null);

    return (
        <ScrollContent>
            <object ref={ref} className={styles.datapath} type="image/svg+xml" data="/svg/seqdatapath.svg" />
        </ScrollContent>
    );
}

export default Datapath;
