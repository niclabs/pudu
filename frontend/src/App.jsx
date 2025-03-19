import { useEffect, useState } from "react";
import { Tree } from "react-arborist";
import Node from "./Node";
import { createTag, deleteTag, editTagName, editTagDescription, moveTag } from "./tagApi";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { AiOutlineEdit } from "react-icons/ai";

function App() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [editDescriptionValue, setEditDescriptionValue] = useState("");

  const fetchTreeData = async () => {
    const response = await fetch("http://localhost:8000/api/tags/");
    const data = await response.json();
    setTags(data);
  };

  const onCreate = async () => {
    try {
      const parentId = selectedNode ? selectedNode.data.id : null;
      const newTag = { name: "New Tag", parent_tag: parentId };

      const result = await createTag(newTag);
      if (result.id) {
        fetchTreeData();
      }
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const onDelete = async () => {
    try {
      const tagId = selectedNode ? selectedNode.data.id : null;
      if (!tagId) return;
      const result = await deleteTag(tagId);
      if (result.success) {
        fetchTreeData();
        setSelectedNode(null);
      } else {
        console.error("Error deleting tag:", result.error);
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const onMove = async ({ dragIds, parentId }) => {
    try {
      const moveData = {
        id: Number(dragIds[0]),
        parent_tag: parentId === 0 ? null : Number(parentId),
      };

      const result = await moveTag(moveData);

      if (result.id) {
        fetchTreeData();
      }
    } catch (error) {
      console.error("Error moving tag:", error);
    }
  };

  const handleNameSave = async () => {
    setIsNameEditing(false);

    if (editNameValue !== selectedNode.data.name) {
      try {
        const result = await editTagName(selectedNode.data.id, editNameValue);
        if (result) {
          fetchTreeData();
          selectedNode.data.name = editNameValue;
        }
      } catch (error) {
        console.error("Error updating tag name:", error);
      }
    }
  };

  const handleDescriptionSave = async () => {
    setIsDescriptionEditing(false);

    if (editDescriptionValue !== selectedNode.data.description) {
      try {
        const result = await editTagDescription(
          selectedNode.data.id,
          editDescriptionValue
        );
        if (result) {
          fetchTreeData();
          selectedNode.data.description = editDescriptionValue;
        }
      } catch (error) {
        console.error("Error updating tag description:", error);
      }
    }
  };

  useEffect(() => {
    fetchTreeData();
    setLoading(false);
  }, []);

  if (loading) return <div>Loading tree...</div>;

  return (
    
    <div className="flex flex-row h-screen">
      <div className = " m-4 tree-component flex-1">
        <div className="demo-instructions">
          <h1 className="text-2xl font-bold">Tag Manager</h1>
            <p>Click on a tag to select it</p>
            <p>Press a to add a tag</p>
            <p>Press backspace to delete a tag and its children</p>
          </div>

        <div className="tree-container flex grow">
          <Tree
            data={tags}
            openByDefault={false}
            width={500}
            height={screen.height - 300}
            indent={24}
            rowHeight={40}
            onCreate={onCreate}
            onDelete={onDelete}
            onMove={onMove}
          >
            {(node) => (
              <Node {...node} selectedNode={selectedNode} setSelectedNode={setSelectedNode} />
            )}
          </Tree>
        </div>
      </div>

      <div className = "m-4 card-component flex-1/2">
        <Card className="mx-auto shadow-lg rounded-2xl max-w-2xl max-h-2xl">
          <CardHeader>
            <CardTitle>
              {selectedNode ? (
                isNameEditing ? (
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    onBlur={handleNameSave}
                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <p>Selected Tag: {selectedNode.data.name}</p>
                    <AiOutlineEdit
                      className="cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setIsNameEditing(true);
                        setEditNameValue(selectedNode.data.name);
                      }}
                    />
                  </div>
                )
              ) : (
                <p>No tag selected</p>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-15">
            {selectedNode ? (
              isDescriptionEditing ? (
                <textarea
                  value={editDescriptionValue}
                  onChange={(e) => setEditDescriptionValue(e.target.value)}
                  onBlur={handleDescriptionSave}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                  autoFocus
                  rows={2}
                  className="resize-none w-full p-2 border rounded-md"
                />
              ) : (
                <div className="flex items-center justify-between ">
                  <p className="text-gray-500 flex-1 max-h-20 overflow-y-auto p-1">
                    Description: {selectedNode.data.description ||
                      "Create a description for this tag"}
                  </p>
                  <AiOutlineEdit
                    className="cursor-pointer text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setIsDescriptionEditing(true);
                      setEditDescriptionValue(selectedNode.data.description);
                    }}
                  />
                </div>
              )
            ) : (
              <p className="text-gray-500">Select a tag to view its description</p>
            )}
          </CardContent>
          <CardFooter className="mt-2 text-sm">
            There are currently X articles using this tag!
          </CardFooter>
        </Card>
      
      </div>
   </div>
  );
}

export default App;
