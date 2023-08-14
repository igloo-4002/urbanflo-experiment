import React from "react";

const FloatingPlayPause = ({ nodes, edges }) => {
  const handleDownload = () => {
    const xmlContent = generateXml(nodes, edges);
    const blob = new Blob([xmlContent], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "network_data.xml";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateXml = (nodes, edges) => {
    // You can create your own XML structure here based on the nodes and edges data
    // For simplicity, I'll use a basic example
    const xmlNodes = nodes.map((node) => `<Node id="${node.id}" x="${node.x}" y="${node.y}" type="${node.type}" />`);
    const xmlEdges = edges.map((edge) => `<Edge id="${edge.id}" from="${edge.from}" to="${edge.to}" priority="${edge.priority}" numLanes="${edge.numLanes}" speed="${edge.speed}" />`);

    const xml = `
      <Network>
        ${xmlNodes.join("\n")}
        ${xmlEdges.join("\n")}
      </Network>
    `;

    return xml;
  };

  return (
    <div
      className="absolute bottom-4 right-4 items-center justify-center rounded-full flex p-4 z-10"
      style={{ backgroundColor: "green" }}
    >
      <button
        onClick={handleDownload}
        className="text-white font-sans font-medium"
      >
        Download XML
      </button>
    </div>
  );
};

export default FloatingPlayPause;
