import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Tag, Trash2 } from "lucide-react";
import { Tree } from "react-arborist";
import Node from "./Node";
import {
  createTag,
  deleteTag,
  editTagName,
  editTagDescription,
  moveTag,
} from "./tagApi";
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

function TagView() {
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

  const fetchTreeData = async () => {
    const response = await fetch("http://localhost:8000/api/tags/");
    const data = await response.json();
    setTags(data);
  };

  const fetchStudyData = async () => {
    const response = await fetch("http://localhost:8000/api/studies/");
    const data = await response.json();

    const refineTable = data.map((study) => ({
      id: study.id,
      title: study.title,
      year: study.year,
      authors: study.authors_display.join(", "),
      flags: study.flags,
      tags: study.tags_display.map((tag) => tag.name).join(", "),
    }));
    setTableData(refineTable);
    console.log("fetched table data");
  };

  const fetchTagCount = async () => {
    const response = await fetch("http://localhost:8000/api/tags/count/");
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
    const response = await fetch(`http://localhost:8000/api/studies/${id}/`);
    const data = await response.json();
    setSelectedStudyDetail(data);
    console.log("fetched study detail data", data);
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

  useEffect(() => {
    fetchTreeData();
    fetchStudyData();
    fetchTagCount();
    setLoading(false);
    if (studyOpen && selectedStudy) {
      fetchStudyDetailed(selectedStudy);
    }
  }, [studyOpen, selectedStudy]);

  if (loading) return <div>Loading tree...</div>;

  return (
    <div className="flex flex-row w-full h-full bg-violet-50">
      {/* Tree */}
      <div className="m-4 p-4 tree-component flex-1 bg-indigo-100 rounded-xl shadow-lg relative">
        <div className="flex justify-between items-start">
          <div className="demo-instructions">
            <h1 className="text-2xl font-bold">Tag Manager</h1>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={onCreate}
              className="bg-violet-900 text-violet-50 text-xs hover:bg-violet-950 flex"
            >
              <Tag className="" /> Add Tag
            </Button>
            <Button
              onClick={onDelete}
              className="bg-violet-900 text-violet-50 text-xs hover:bg-violet-950 flex"
            >
              <Trash2 className="" /> Delete Tag
            </Button>
          </div>
        </div>

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

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setStudyOpen(false)}
                className="border-violet-700 text-violet-700 hover:bg-violet-100"
              >
                Close
              </Button>
              <Link to={`/editstudy/${selectedStudyDetail?.id}/`}>
                <Button className="bg-violet-900 text-violet-50 hover:bg-violet-950">
                  Edit Study
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="h-[calc(100vh-400px)]">
          <DataTable
            columns={columns(fetchStudyData, setStudyOpen, setSelectedStudy)}
            data={tableData}
            selectedTag={selectedNode?.data?.name}
          />
        </div>
      </div>
    </div>
  );
}

export default TagView;
