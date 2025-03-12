import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";

const Node = ({ node, style, dragHandle, setSelectedNode }) => {
  const handleClick = () => {
    node.toggle();  // Toggle the open/close state
    node.select();
    setSelectedNode(node); 
    }
  

  return (
    <div
      className={`node-container ${node.isSelected ? "selected" : ""}`}
      style={style}
      ref={dragHandle}
    >
      <div className="node-content" onClick={handleClick}>
        {node.isOpen ? (
          <AiOutlineMinusSquare style={{ marginRight: "8px" }} />
        ) : (
          <AiOutlinePlusSquare style={{ marginRight: "8px" }} />
        )}
        <span className="node-text">
          <span>{node.data.name}</span>
        </span>
      </div>
    </div>
  );
};

export default Node;
