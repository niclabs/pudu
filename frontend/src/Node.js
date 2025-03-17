import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";

const Node = ({ node, style, dragHandle, selectedNode, setSelectedNode }) => {
  // Handle click event: toggle the node if the user clicks the toggle icon, selects the node
  const handleClick = (e) => {
    if (e.target.closest(".toggle-icon")) {
      node.toggle();
      return;
    }
  
    if (selectedNode?.id === node.id) {
      node.deselect();
      setSelectedNode(null);
    } else {
      node.select();
      setSelectedNode(node);
    }
  };
  
  
  return (
    <div
    className={`node-container ${selectedNode?.id === node.id ? "selected" : ""}`}
      onClick={handleClick}
      style={style}
      ref={dragHandle}
    >
      <div className="node-content">
      {node.isOpen ? (
        <AiOutlineMinusSquare className="toggle-icon" style={{ marginRight: "8px" }} />
      ) : (
        <AiOutlinePlusSquare className="toggle-icon" style={{ marginRight: "8px" }} />
      )}

        <span className="node-text">
          <span>{node.data.name}</span>
        </span>
      </div>
    </div>
  );
};

export default Node;
