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
      className={`p-2 flex cursor-pointer items-center transition-colors duration-200 
      ${selectedNode?.id === node.id ? "bg-blue-100 font-bold" : "hover:bg-gray-100"}`}
      onClick={handleClick}
      style={style}
      ref={dragHandle}
    >
      <div className="flex items-center">
        {node.isOpen ? (
          <AiOutlineMinusSquare className="toggle-icon mr-2 text-blue-500" />
        ) : (
          <AiOutlinePlusSquare className="toggle-icon mr-2 text-blue-500" />
        )}

        <span className="ml-2">{node.data.name}</span>
      </div>
    </div>
  );
};

export default Node;
