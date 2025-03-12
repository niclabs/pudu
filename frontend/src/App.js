import { useEffect, useState } from "react";
import { Tree } from "react-arborist";
import "./styles.css";
import Node from "./Node";
import { createTag, deleteTag } from "./tagApi";


import "./App.css";

function App() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);

  //Tree controller functions

  // onCreate creates a new tag and attaches it to the selected tag, then refreshes the tree.
  const onCreate = async () => {
    try {
      // Check if a tag is selected, if not, set a default parent as null
      const parentId = selectedNode ? selectedNode.data.id : null;
      const newTag = { name: "New Tag", parent_tag: parentId };

      console.log("Creating tag with parent:", parentId); // Debugging
      const newTagData = await createTag(newTag);

      // Refetch the tree data after creating the new tag
      const response = await fetch("http://localhost:8000/api/tags/");
      const data = await response.json();
      setTags(data); // Save the updated tree data to state

    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const onDelete = async () => {
    try {
        const tagId = selectedNode ? selectedNode.data.id : null;
        if (!tagId) return; // In case no tag is selected
        console.log("Deleting tag:", tagId); // Debug
        const result = await deleteTag(tagId);
        if (result.success) {
            // Refetch the tree data after deleting the tag
            const response = await fetch("http://localhost:8000/api/tags/");
            const data = await response.json();
            setTags(data); // Save the updated tree data to state
        } else {
            console.error("Error deleting tag:", result.error);
        }
    } catch (error) {
        console.error("Error deleting tag:", error);
    }
};

//TODO: Implement the following functions:  
  // const onRename = ({ id, name }) => {return false};
    //add a description function?
  // const onMove = ({ dragIds, parentId, index }) => {return false};

  useEffect(() => {
    fetch("http://localhost:8000/api/tags/")
      .then((response) => response.json())
      .then((data) => {
        setTags(data); //Saves tree data to state
        setLoading(false); //Complete loading
      });
  }, []);

  if (loading) return <div>Loading tree...</div>;

  return (
    <div>
      {/* Display the selected tag */}
      <div className="selected-tag-info">
        {selectedNode ? (
          <p>Selected Tag: {selectedNode.data.name}</p>
        ) : (
          <p>No tag selected</p>
        )}
        <p>Click on a tag to select it</p>
        <p>Press a to add a tag</p>
        <p>Press backspace to delete a tag and its children</p>
      </div>

      {/* Render the tree */}
      <Tree
        data={tags}
        openByDefault={true}
        width={500}
        height={1000}
        indent={24}
        rowHeight={32}
        onCreate={onCreate}
        onDelete={onDelete}
      >
      {(node) => <Node {...node} setSelectedNode={setSelectedNode} />}
      </Tree>
    </div>
  );
}

export default App;