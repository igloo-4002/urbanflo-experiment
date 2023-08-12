import { KonvaEventObject } from "konva/lib/Node";
import { Circle, Layer, Line, Stage } from "react-konva";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { useState } from "react";

type Node = {
  id: string;
  x: number;
  y: number;
  type: string;
};

type Edge = {
  id: string;
  from: string;
  to: string;
  priority: number;
  numLanes: number;
  speed: number;
};

type Network = {
  nodes: Record<string, Node>;
  edges: Record<string, Edge>;
  addNode: (node: Node) => void;
  drawEdge: (from: Node, to: Node) => void;
};

const useNetworkStore = create<Network>((set) => ({
  nodes: {},
  edges: {},
  addNode: (node) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [node.id]: node,
      },
    })),
  drawEdge: (from, to) =>
    set((state) => ({
      edges: {
        ...state.edges,
        [`${from.id}${to.id}`]: {
          id: `${from.id}${to.id}`,
          from: from.id,
          to: to.id,
          priority: -1,
          numLanes: 1,
          speed: 13.89,
        },
      },
    })),
}));

function exportNetwork(network: Network) {
  console.log(network);
}

export default function App() {
  const [mode, setMode] = useState<"node" | "edge">("node");

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const network = useNetworkStore();
  // console.log(network);

  const nodes = Object.values(network.nodes);
  const edges = Object.values(network.edges);

  async function onClick(event: KonvaEventObject<MouseEvent>) {
    if (mode === "node") {
      network.addNode({
        id: uuidv4(),
        x: event.evt.clientX,
        y: event.evt.clientY,
        type: "priority",
      });
    } else if (mode === "edge") {
      if (!selectedNode) {
        // select a node if one hasn't been selected yet
        const node = nodes.find((node) => {
          const distance = Math.sqrt(
            Math.pow(node.x - event.evt.clientX, 2) +
              Math.pow(node.y - event.evt.clientY, 2)
          );
          return distance < 32;
        });
        node && setSelectedNode(node.id);
      } else {
        // draw an edge from the selected node to the clicked node
        const from = network.nodes[selectedNode];
        const to = nodes.find((node) => {
          const distance = Math.sqrt(
            Math.pow(node.x - event.evt.clientX, 2) +
              Math.pow(node.y - event.evt.clientY, 2)
          );
          return distance < 32;
        });
        if (to) {
          network.drawEdge(from, to);
          setSelectedNode(null);
        }
      }
      //
    } else {
      const never: never = mode;
      return never;
    }
  }

  function ModeToggle() {
    return (
      <div
        className="absolute top-16 right-16 items-center justify-center rounded-full flex p-4 z-10 w-32"
        style={{ backgroundColor: mode === "node" ? "red" : "black" }}
      >
        <button
          onClick={() => setMode((mode) => (mode === "node" ? "edge" : "node"))}
          className="text-white font-sans font-medium"
        >
          {mode.toUpperCase()}
        </button>
      </div>
    );
  }

  function ExportButton() {
    return (
      <div className="absolute top-16 left-16 items-center justify-center rounded-full flex p-4 z-10 w-48 bg-green-500">
        <button
          onClick={() => exportNetwork(network)}
          className="text-white font-sans font-medium"
        >
          Export Network
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen items-center justify-center flex">
      <ExportButton />
      <ModeToggle />
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={onClick}
      >
        <Layer>
          {nodes.map((node, index) => {
            const fill = selectedNode === node.id ? "blue" : "red";

            return (
              <Circle
                key={index}
                x={node.x}
                y={node.y}
                fill={fill}
                width={64}
                height={64}
              />
            );
          })}
        </Layer>
        <Layer>
          {edges.map((edge, index) => {
            const from = network.nodes[edge.from];
            const to = network.nodes[edge.to];

            return (
              <Line
                key={index}
                stroke="black"
                points={[from.x, from.y, to.x, to.y]}
              />
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
