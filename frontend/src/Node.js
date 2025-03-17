import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";

const Node = ({ node, style, dragHandle, setSelectedNode }) => {
  const handleClick = (e) => {
    if (e.target.closest(".toggle-icon")) {
    node.toggle();
  }
    node.select();
    setSelectedNode(node); 
    }
  

  return (
    <div
      className={`node-container ${node.isSelected ? "selected" : ""}` }
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
