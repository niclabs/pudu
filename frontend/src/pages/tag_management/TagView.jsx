/**
 * TagView.jsx 
 * @file Component for rendering the tag management view. Used to display the "Tag Management" page of the navbar of the application.
 * 
 * main functionality:
 * - Displays a tree of tags on the left side, allowing users to create, edit, delete, and rearrange tags
 * - Shows details of the selected tag and a count of associated studies in the top right panel
 * - Renders a table of studies associated with the selected tag in the bottom right panel
 * 
 * @requires utils/authservice  for making authenticated requests to the backend
 * @requires pages/tag_management/Node   custom component for rendering nodes in the tag tree
 * @requires components/custom/dataTable/data-table  the custom data table used to display studies
 * 
 * @component
 * @returns {JSX.Element} The rendered "Tag Management" view.
 */



import { AuthService } from "../../utils/authservice";
import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Filter, ListFilter, Tag, Trash2 } from "lucide-react";
import { Tree } from "react-arborist";
import Node from "./Node";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { AiOutlineEdit } from "react-icons/ai";
import { DataTable } from "../../components/custom/dataTable/data-table";
import { columns } from "../../components/custom/dataTable/columns";
import { Input } from "../../components/custom/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Toaster, toast } from 'sonner';
import { ta } from "date-fns/locale";
import { set } from "date-fns";

function TagView() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tagDeleteOpen, setTagDeleteOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagCount, setTagCount] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);
  const [editDescriptionValue, setEditDescriptionValue] = useState("");
  const [studyOpen, setStudyOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [selectedStudyDetail, setSelectedStudyDetail] = useState(null);
  const [filterBy, setFilterBy] = useState(null);


  const reviewId = sessionStorage.getItem('review_id');
  // const response = await AuthService.fetchWithAuth(
  const createTag = async (newTag) => {
    const response = await AuthService.fetchWithAuth(`http://127.0.0.1:8000/api/tags/?review_id=${reviewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTag),
    });
    return response.json();
  };

  const deleteTag = async (tagId) => {
    const response = await AuthService.fetchWithAuth(`http://127.0.0.1:8000/api/tags/${tagId}/?review_id=${reviewId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 204) {
      return { success: true };
    }
    return response.json();
  };

  const moveTag = async (dragMove) => {
    const response = await AuthService.fetchWithAuth(`http://127.0.0.1:8000/api/tags/?review_id=${reviewId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dragMove),
    });
    return response.json();
  };

  const editTagName = async (tagId, newName) => {
    const response = await AuthService.fetchWithAuth(`http://127.0.0.1:8000/api/tags/${tagId}/?review_id=${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    return response.json();
  };

  const editTagDescription = async (tagId, newDescription) => {
    const response = await AuthService.fetchWithAuth(`http://127.0.0.1:8000/api/tags/${tagId}/?review_id=${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: newDescription }),
    });
    return response.json();
  };


  const fetchTreeData = async () => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/tags/?review_id=${reviewId}`);
    const data = await response.json();
    setTags(data);
    setOriginalTags(data);
  };

  const fetchStudyData = async () => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/studies/?review_id=${reviewId}`);
    const data = await response.json();

    const refineTable = data.map((study) => ({
      id: study.id,
      title: study.title,
      year: study.year,
      authors: study.authors_display.join(", "),
      flags: study.flags,
      tags: study.tags_display.map((tag) => tag.name).join(", "),
      tags_list: study.tags_display.map((tag) => tag.name),
      notes: study.summary,
    }));
    setTableData(refineTable);
  };

  const fetchTagCount = async () => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/tags/count/?review_id=${reviewId}`);
    const data = await response.json();
    setTagCount(data);
  };

  const refineStudy = (study) => ({
    title: study.title,
    year: study.year,
    authors: study.authors_display.join(", "),
    doi: study.doi,
    url: study.url,
    pages: study.pages,
    flags: study.flags.join(", "),
    tags: study.tags_display.map((tag) => tag.name).join(", "),
    abstract: study.abstract,
    summary: study.summary,
  });

  const labelMap = {
    title: "Title",
    year: "Year",
    authors: "Authors",
    abstract: "Abstract",
    summary: "Notes",
    doi: "DOI",
    url: "URL",
    pages: "Pages",
    flags: "Flags",
    tags: "Tags",
  };

  const fetchStudyDetailed = async (id) => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/studies/${id}/?review_id=${reviewId}`);
    const data = await response.json();
    setSelectedStudyDetail(data);
  };

  const deleteStudyData = async (id) => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/studies/${id}/?review_id=${reviewId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchStudyData(); // Trigger data re-fetch after deletion
    } else {
      console.error("Error deleting study:", response.statusText);
    }
    fetchTagCount();
    setDeleteOpen(false);
  };
  const onCreate = async () => {
    try {
      const parentId = selectedNode ? selectedNode.data.id : null;
      const newTag = { name: "New Tag", parent_tag: parentId };

      const result = await createTag(newTag);
      if (result.id) {
        fetchTreeData();
        setSelectedNode(null);
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

    setTagDeleteOpen(false)
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
          editDescriptionValue,
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


  const [originalTags, setOriginalTags] = useState([]);
  const [isSortMenuOpen, setSortMenuOpen] = useState(false);
  const handleSort = (order) => {
    if (order === 'reset') {
      setTags(originalTags);
      setSortMenuOpen(false);
      return;
    }
    const sortNodes = (nodes) => {
      return [...nodes].sort((a, b) => {
        const nameA = a.name ? a.name.toLowerCase() : "";
        const nameB = b.name ? b.name.toLowerCase() : "";

        if (order === 'asc') return nameA.localeCompare(nameB); // A-Z
        if (order === 'desc') return nameB.localeCompare(nameA); // Z-A
        return 0;
      }).map(node => ({
        ...node,
        children: node.children ? sortNodes(node.children) : []
      }));
    };

    const sortedTags = sortNodes(tags);
    setTags(sortedTags);
    setSortMenuOpen(false);
  };

  const fetchDescendantTags = (nodeData) => {
    let names = [nodeData.name];
    
    if (nodeData.children && nodeData.children.length > 0) {
      nodeData.children.forEach((child) => {
        names = names.concat(fetchDescendantTags(child));
      });
    }
    
    return names;
  };
  
  const filteredData = selectedNode
    ? tableData.filter((item) => {
      if ((!item.tags_list) || item.tags_list.length === 0) {
        return false;
      }
      const descendantTags = fetchDescendantTags(selectedNode.data);
      return descendantTags.some(tagName => item.tags_list.includes(tagName));
    })
    : tableData;

  useEffect(() => {
    fetchTreeData();
    fetchStudyData();
    fetchTagCount();
    setLoading(false);
    if ((studyOpen | deleteOpen) && selectedStudy) {
      fetchStudyDetailed(selectedStudy);
    }
  }, [studyOpen, selectedStudy]);

  if (loading) return <div>Loading tree...</div>;

  return (
    <div className="flex flex-row w-full h-[calc(100vh-64px)] bg-violet-50 ">
      <Toaster richColors />
      {/* Tree */}
      <div className="m-4 p-4 tree-component flex-1 bg-indigo-100 rounded-xl shadow-lg relative">
        <div className="flex justify-between items-start">
          <div className="demo-instructions">
            <h1 className="text-2xl font-bold">Tag Management</h1>

          </div>
          <div className="flex space-x-2 relative">

            <Button
            onClick={() => {
              if (selectedNode) {
                toast.success(`Tag created as a child of ${selectedNode.data.name}!`);
              }
              else{
                toast.success("Tag created on root level!");
              }
              onCreate();
            }}
              className="bg-violet-900 text-violet-50 text-xs font-bold hover:bg-violet-950 flex"
            >
              <Tag className="mr-2 h-4 w-4" /> Add Tag
            </Button>

            <div className="relative">
              <Button
                onClick={() => setSortMenuOpen(!isSortMenuOpen)}
                className="bg-violet-900 text-violet-50 text-xs font-bold hover:bg-violet-950 flex"
              >
                <Filter className="mr-2 h-4 w-4" /> Sort Tag
              </Button>
              {isSortMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
                  <button
                    onClick={() => handleSort('asc')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    A-Z
                  </button>
                  <button
                    onClick={() => handleSort('desc')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Z-A
                  </button>

                  <button
                    onClick={() => handleSort('reset')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Created (desc)
                  </button>
                </div>
              )}


            </div>
          </div>

        </div>
        <p className=" text-gray-600">Organize your review with a custom tag tree.</p>
        <p className=" text-gray-600"> Drag and Drop tags to edit the tree's structure.</p>
        <div className="tree-container flex-grow overflow-auto mt-4">

          <Tree
            data={tags}
            openByDefault={false}
            width={400}
            height={screen.height - 400}
            indent={24}
            rowHeight={40}
            onCreate={onCreate}
            onDelete={onDelete}
            onMove={onMove}
          >
            {(node) => (
              <Node
                {...node}
                selectedNode={selectedNode}
                setSelectedNode={setSelectedNode}
              />
            )}
          </Tree>
        </div>
        <Button
          onClick={() => {
            if (!selectedNode) {
              toast.error("No tag selected for deletion.");
              return;
            }
            setTagDeleteOpen(true);
          }}
          className="absolute bottom-4 right-4 bg-red-600 text-violet-50 text-xs font-bold hover:bg-red-800 flex"
        >
          <Trash2 className="" /> Delete Tag
        </Button>
      </div>
      {/*  Card and Table */}
      <div className="p-4 flex-1/2">
        <div>
          <Card className="mx-auto shadow-lg rounded-xl w-full max-w-3xl h-75 border-slate-300 bg-slate-50">
            <CardHeader className="p-4 md:p-4">
              <CardTitle>
                {selectedNode ? (
                  isNameEditing ? (
                    <Input
                      type="text"
                      value={editNameValue}
                      onChange={(e) => setEditNameValue(e.target.value)}
                      onBlur={handleNameSave}
                      onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                      autoFocus
                      maxLength={45}
                      className="w-full p-2 border rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <p className="text-xl md:text-2xl truncate">
                        <span className="font-bold">Selected Tag: </span>
                        {selectedNode.data.name}
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
                        <span className="font-bold">Description: </span>{" "}
                        {selectedNode.data.description ||
                          "Create a description for this tag"}
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
                <p className="text-gray-500 text-base md:text-xl">
                  Select a tag to view its description
                </p>
              )}
            </CardContent>

            <CardFooter>
              {selectedNode && (
                <p className="text-base md:text-xl">
                  Articles currently using this tag:{" "}
                  {tagCount.find((x) => x.id === parseInt(selectedNode.data.id))
                    ?.study_count || 0}{" "}
                </p>
              )}
            </CardFooter>
          </Card>
        </div>
        <Dialog open={studyOpen} onOpenChange={setStudyOpen}>
          <DialogContent className="!w-[40vw] !max-w-none !p-8 bg-violet-50 text-lg h-[80vh]">
            <DialogHeader>
              <DialogTitle>Study Metadata</DialogTitle>
            </DialogHeader>
            <div className="p-4 h-[calc(80vh-160px)] overflow-auto">
              {selectedStudyDetail &&
                Object.entries(refineStudy(selectedStudyDetail)).map(
                  ([key, value]) => (
                    <div key={key} className="mb-4">
                      <strong>{labelMap[key] || key}:</strong>{" "}
                      {key === "url" ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          {value}
                        </a>
                      ) : (
                        String(value)
                      )}
                    </div>
                  ),
                )}
            </div>
            <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
              <Button
                variant="outline"
                onClick={() => setStudyOpen(false)}
                className="border-violet-700 text-violet-700 hover:bg-violet-100"
              >
                Cancel
              </Button>
              <Link to={`/editstudy/${selectedStudyDetail?.id}/`}>
                <Button className="bg-violet-900 text-violet-50 hover:bg-violet-950">
                  Edit Study
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="  bg-violet-50  ">
            <DialogHeader>
              <DialogTitle>Deleting Study</DialogTitle>
            </DialogHeader>
            <b>{selectedStudyDetail?.title}</b>
            <div>This study is being deleted. This action cannot be undone.</div>
            <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
              <Button
                variant="outline"
                onClick={() => setDeleteOpen(false)}
                className="border-violet-700 text-violet-700 hover:bg-violet-100"
              >
                Cancel
              </Button>
              <Button className="bg-red-600 text-violet-50 hover:bg-red-800"
                onClick={() => deleteStudyData(selectedStudyDetail?.id)}>
                Delete Study
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={tagDeleteOpen} onOpenChange={setTagDeleteOpen}>
          <DialogContent className="  bg-violet-50  ">
            <DialogHeader>
              <DialogTitle>Deleting Tag</DialogTitle>
            </DialogHeader>
            <b>{selectedNode?.data?.name}</b>
            <div>This tag and any children it has are being deleted.</div>
            <div>This action cannot be undone.</div>
            <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
              <Button
                variant="outline"
                onClick={() => setTagDeleteOpen(false)}
                className="border-violet-700 text-violet-700 hover:bg-violet-100"
              >
                Cancel
              </Button>
              <Button className="bg-red-600 text-violet-50 hover:bg-red-800"
                onClick={() => onDelete()}>
                Delete Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="h-[calc(100vh-400px)] m-4 overflow-y-auto">
          <DataTable
            columns={columns(setStudyOpen, setSelectedStudy, setDeleteOpen)}
            data={filteredData}
            filterBy={null}
          />
        </div>
      </div>
    </div>
  );
}

export default TagView;