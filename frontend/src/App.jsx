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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    
    <div className="flex flex-row h-screen bg-violet-50">
      {/* Tree */}
      <div className = " m-4 p-4 tree-component  flex-1 bg-indigo-100 rounded-xl shadow-lg">
        <div className="demo-instructions">
          <h1 className="text-2xl font-bold">Tag Manager</h1>
            <p>Press a to add a tag</p>
            <p>Press backspace to delete a tag and its children</p>
          </div>

        <div className="tree-container flex grow-1 mt-4">
          <Tree
            data={tags}
            openByDefault={false}
            width={400}
            height={screen.height - 350}
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
      {/*  Card and Table */}
      <div className="m-4 flex-1/2">
        <div>
          <Card className="mx-auto shadow-lg rounded-xl w-full max-w-3xl border-white bg-white">
            <CardHeader className="p-4 md:p-4">
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
                      maxLength={30}
                      className="w-full p-2 border rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xl md:text-2xl truncate">
                        <span className="font-bold">Selected Tag: </span>{selectedNode.data.name}
                      </p>
                      <AiOutlineEdit
                        className="cursor-pointer text-gray-500 hover:text-gray-700 flex-shrink-0"
                        onClick={() => {
                          setIsNameEditing(true);
                          setEditNameValue(selectedNode.data.name);
                        }}
                      />
                    </div>
                  )
                ) : (
                  <p className="text-xl md:text-3xl">No tag selected</p>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="md:p-4">
              {selectedNode ? (
                isDescriptionEditing ? (
                  <textarea
                    value={editDescriptionValue}
                    onChange={(e) => setEditDescriptionValue(e.target.value)}
                    onBlur={handleDescriptionSave}
                    onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                    autoFocus
                    rows={3}
                    className="resize-none w-full p-2 border rounded-md"
                  />
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1">
                    <div className="flex-1">
                      <p className="text-gray-500 text-base md:text-l max-h-20 overflow-y-auto pr-2 break-words">
                      <span className="font-bold">Description: </span> {selectedNode.data.description || "Create a description for this tag"}
                      </p>
                    </div>
                    <AiOutlineEdit
                      className="cursor-pointer text-gray-500 hover:text-gray-700 flex-shrink-0 mt-1"
                      onClick={() => {
                        setIsDescriptionEditing(true);
                        setEditDescriptionValue(selectedNode.data.description);
                      }}
                    />
                  </div>
                )
              ) : (
                <p className="text-gray-500 text-base md:text-xl">Select a tag to view its description</p>
              )}
            </CardContent>
            
             <CardFooter className="p-4 md:p- h-8.5"> {/* h-8.5 ODIO ESTO PORFA REVISAR AAAAAAAA */}
             {selectedNode && <p className="text-base md:text-xl">There are currently X articles using this tag!</p>}
            </CardFooter>
            
          </Card>
        </div>
        <div className="mt-6">
        <Table className="text-base bg-white rounded-xl">
          <TableCaption >Articles related to the selected tag.</TableCaption>
          <TableHeader className="text-base text-gray-500">
            <TableRow>
              <TableHead >Title</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Authors</TableHead>
              <TableHead>Categorized</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Baby Yoda Found Dead in Miami: An In-Depth Study</TableCell>
              <TableCell>2005</TableCell>
              <TableCell>George Lucas</TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>Star Wars, Baby Yoda, Miami, Crime, Murder Investigations</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Baby Yoda 2: A Deep-Sea Mystery</TableCell>
              <TableCell>1995</TableCell>
              <TableCell>James Cameron</TableCell>
              <TableCell>No</TableCell>
              <TableCell>Star Wars, Baby Yoda, Atlantis, Deep Sea, Conspiracy</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>UFOs Over Hoth: Baby Yoda’s Disappearance</TableCell>
              <TableCell>1987</TableCell>
              <TableCell>Steven Spielberg</TableCell>
              <TableCell>Yes</TableCell>
              <TableCell>Star Wars, UFOs, Baby Yoda, Mystery, Government Cover-up</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Sith Lords and the Miami Connection: Baby Yoda’s Fate</TableCell>
              <TableCell>1999</TableCell>
              <TableCell>Christopher Nolan</TableCell>
              <TableCell>No</TableCell>
              <TableCell>Star Wars, Sith, Baby Yoda, Miami, Crime, Secret Societies</TableCell>
            </TableRow>
          </TableBody>
        </Table>
 
        </div>
      </div>
  </div>
  );
}

export default App;
