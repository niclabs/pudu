import { useEffect, useState } from "react";
import { Tree } from "react-arborist";
import "./styles.css";
import Node from "./Node";
import { createTag, deleteTag, editTagName, editTagDescription, moveTag } from "./tagApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card"
import {AiOutlineEdit} from "react-icons/ai";



function App() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNameEditing, setIsNameEditing] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)

  //Tree controller functions

  // onCreate creates a new tag and attaches it to the selected tag, then refreshes the tree.
  const onCreate = async () => {
    try {
      // Check if a tag is selected, if not, set a default parent as null
      const parentId = selectedNode ? selectedNode.data.id : null;
      const newTag = { name: "New Tag", parent_tag: parentId };

      console.log("Creating tag with parent:", parentId); // Debugging
      const result = await createTag(newTag);
      console.log('result: ',result)
      if (result.id){
        // Refetch the tree data after creating the new tag
        const response = await fetch("http://localhost:8000/api/tags/");
        const data = await response.json();
        setTags(data); // Save the updated tree data to state
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  //onDelete deletes the selected tag and its children, then refreshes the tree.
  const onDelete = async () => {
    try {
        const tagId = selectedNode ? selectedNode.data.id : null;
        if (!tagId) return; // In case no tag is selected
        console.log("Deleting tag:", tagId); // Debug
        const result = await deleteTag(tagId);
        console.log('result: ',result)
        if (result.success) {
            // Refetch the tree data after deleting the tag
            const response = await fetch("http://localhost:8000/api/tags/");
            const data = await response.json();
            setTags(data);
            setSelectedNode(null);
        } else {
            console.error("Error deleting tag:", result.error);
        }
    } catch (error) {
        console.error("Error deleting tag:", error);
    }
};

// onMove moves the selected tag to a new parent tag, then refreshes the tree.
const onMove = async ({ dragIds, parentId }) => {
  try {
    const moveData = {
      id: Number(dragIds[0]),
      parent_tag: parentId === 0 ? null : Number(parentId), // Set parent_tag to null if parentId is 0
    };

    console.log("Moving tag:", moveData.id, "to parent:", moveData.parent_tag);

    const result = await moveTag(moveData);

    if (result.id) {
      // Refetch the tree data after the move operation
      const response = await fetch("http://localhost:8000/api/tags/");
      const data = await response.json();
      setTags(data); // Save the updated tree data to state
    }
  } catch (error) {
    console.error("Error moving tag:", error);
  }
};

const handleNameSave = async () => {
  setIsNameEditing(false);
  const oldNodeId = selectedNode.data.id;

  if (editNameValue !== selectedNode.data.name) {
    try {
      const result = await editTagName(selectedNode.data.id, editNameValue);
      
      if (result) {
       // Refetch the tree data after updating the tag name
        const response = await fetch("http://localhost:8000/api/tags/");
        if (!response.ok) throw new Error("Failed to fetch updated tags");

        const data = await response.json();
        setTags(data);
        console.log(selectedNode)
        selectedNode.data.name = editNameValue;
      }
    } catch (error) {
      console.error("Error updating tag name:", error);
    }
  }
};



  
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
    <div className="m-4">
      {/* Display the selected tag */}
      

      {/* Infocard */}
        <Card className="max-w-sm mx-auto shadow-lg rounded-2xl max-w-xl max-h-xl">
          <CardHeader>
            <CardTitle>
              {selectedNode ? 
                (isNameEditing ? (
                  <input
                  type="text" 
                  value={editNameValue} 
                  onChange={(e) => setEditNameValue(e.target.value)} 
                  onBlur={handleNameSave}
                  autoFocus
                  />) : (
                  <div className="flex items-center justify-between"> 
                    <p>Selected Tag: {selectedNode.data.name}</p>
                    <AiOutlineEdit className="cursor-pointer text-gray-500 hover:text-gray-700" onClick={() => { setIsNameEditing(true); setEditNameValue(selectedNode.data.name); }} />
                  </div>)) : 
                (<p>No tag selected</p>)
              } 
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="flex items-center justify-between">
                <p className="text-gray-500 flex-1">
                  {selectedNode.data.description || "Create a description for this tag"}
                </p>
                <AiOutlineEdit className="cursor-pointer text-gray-500 hover:text-gray-700" onClick={() => setIsDescriptionEditing(true)} />
              </div>
            ) : (
              <p className="text-gray-500">Select a tag to view its description</p>
            )}
            </CardContent>
            <CardFooter
              className="mt-2 text-sm">There are currently X articles using this tag!
            </CardFooter>
        </Card>

      {/* Display instructions */}
      <h1 className="text-2xl font-bold">Tag Manager</h1>
      <div className="demo-instructions">
        <p>Click on a tag to select it</p>
        <p>Press a to add a tag</p>
        <p>Press backspace to delete a tag and its children</p>
      </div>
      
      

      {/* Render the tree */}
      <Tree
        data={tags}
        openByDefault={false}
        width={400}
        height={1000}
        indent={24}
        rowHeight={40}
        onCreate={onCreate}
        onDelete={onDelete}
        onMove={onMove}
      >
      {(node) => <Node {...node} selectedNode= {selectedNode} setSelectedNode={setSelectedNode} />}
      </Tree>
      
    </div>
  );
}

export default App;