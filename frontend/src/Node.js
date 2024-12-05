import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
const Node = ({ node, style, dragHandle, tree }) => {
  // console.log(node, tree);
  return (
    <div className="node-container" style={style} ref={dragHandle}>
      <div
        className="node-content"
        onClick={() => node.isInternal && node.toggle()}
      >
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