import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";

const Node = ({ node, style, dragHandle, selectedNode, setSelectedNode }) => {
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
      className={`p-2 flex cursor-pointer items-center rounded-lg w-11/12 transition-all duration-200
      ${selectedNode?.id === node.id ? "bg-violet-400 font-bold text-slate-100" : "hover:bg-violet-200"}`}
      onClick={handleClick}
      style={style}
      ref={dragHandle}
    >
      <div className="flex items-center ml-2 w-full">
        {node.isOpen ? (
          <AiOutlineMinusSquare className="toggle-icon mr-2 text-violet-900 shrink-0" />
        ) : (
          <AiOutlinePlusSquare className="toggle-icon mr-2 text-violet-900 shrink-0" />
        )}

        {/* Ensures text truncation and correct flex behavior */}
        <span className="ml-2 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{node.data.name}</span>
      </div>
    </div>
  );
};

export default Node;
