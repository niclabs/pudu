import { useEffect, useState } from "react";
import { DataTable } from "@/components/custom/dataTable/data-table";
import { columns } from "@/components/custom/dataTable/columns";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  BookText,
  FileUp,
  Flag,
  BookOpenCheck,
  BookOpenText,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

function StudyView() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [filterBy, setFilterBy] = useState(null);
  const [flagCount, setFlagCount] = useState([]);
  const [selectedStudyDetail, setSelectedStudyDetail] = useState(null);

  const reviewId = localStorage.getItem('review_id');

  const fetchStudyData = async () => {
    const response = await fetch(`http://localhost:8000/api/studies/?review_id=${reviewId}`);
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

  const deleteStudyData = async (id) => {
    const response = await fetch(`http://localhost:8000/api/studies/${id}/?review_id=${reviewId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      fetchStudyData(); // Trigger data re-fetch after deletion
      fetchFlagCount();
    } else {
      console.error("Error deleting study:", response.statusText);
    }
    setDeleteOpen(false);
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
    const response = await fetch(`http://localhost:8000/api/studies/${id}/?review_id=${reviewId}`);
    const data = await response.json();
    setSelectedStudyDetail(data);
    console.log("fetched study detail data", data);
  };

  useEffect(() => {
    console.log("Currently on review ",reviewId);
    fetchStudyData();
    fetchFlagCount();
    if ((studyOpen || deleteOpen ) && selectedStudy) {
      fetchStudyDetailed(selectedStudy);
    }
  }, [studyOpen, selectedStudy]);

  const fetchFlagCount = async () => {
    const response = await fetch(`http://localhost:8000/api/flags/count/?review_id=${reviewId}`);
    const data = await response.json();
    setFlagCount(data);
    console.log(data);
  };

  const handleImportSubmit = async () => {
    if (!importFile) {
      setImportFile(null);
      return;
    }

    try {
      const fileText = await importFile.text(); // Read the file as text
      const jsonData = JSON.parse(fileText); // Parse JSON content
      console.log("Imported JSON Data:", jsonData);

      const response = await fetch(`http://localhost:8000/api/import/?review_id=${reviewId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Import result:", result);
    } catch (error) {
      console.error("Failed to read, parse, or submit the file:", error);
    }

    fetchStudyData();
    fetchFlagCount();

    setImportFile(null);
    setImportOpen(false);
  };

  const handleExportJSON = async () => {
    const response = await fetch(`http://localhost:8000/api/export/?review_id=${reviewId}`);

    const data = await response.json();
    const json = JSON.stringify(data);

    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = href;
    link.download = "review_export" + ".json"; //remember to add review name when it exists!
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    setExportOpen(false);
  };

  const handleExportCSV = async () => {
    const response = await fetch(`http://localhost:8000/api/export_csv/?review_id=${reviewId}`);
  
    if (!response.ok) {
      console.error("Export failed:", response.statusText);
      return;
    }
  
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
  
    link.href = href;
    link.download = `review_export_${reviewId}.csv`; // Optional: add review name if available
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    setExportOpen(false);
  };

  return (
    <div className="flex flex-col w-full h-full p-4 bg-violet-50 min-h-screen">
      <h1 className="text-4xl font-bold">Studies</h1>
      <p className=" text-gray-600 mb-6">Browse and manage studies in your review.</p>
      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-4">
          <Button
            className="bg-emerald-400 text-violet-50 font-bold text-xl p-6 hover:bg-emerald-500"
            onClick={() =>
              setFilterBy(filterBy === "Reviewed" ? null : "Reviewed")
            }
          >
            <BookOpenCheck className="mr-2" /> Reviewed:{" "}
            {flagCount["Reviewed"] || 0}
          </Button>
          <Button
            className="bg-cyan-500 text-violet-50 font-bold text-xl p-6 hover:bg-cyan-600"
            onClick={() =>
              setFilterBy(
                filterBy === "Pending Review" ? null : "Pending Review",
              )
            }
          >
            <BookOpenText className="mr-2" /> Pending Review:{" "}
            {flagCount["Pending Review"] || 0}
          </Button>
          <Button
            className="bg-red-400 text-violet-50 font-bold text-xl p-6 hover:bg-red-500"
            onClick={() =>
              setFilterBy(filterBy === "Missing Data" ? null : "Missing Data")
            }
          >
            <BookOpen className="mr-2" /> Missing Data:{" "}
            {flagCount["Missing Data"] || 0}
          </Button>
          <Button
            className="bg-orange-400 text-violet-50 font-bold text-xl p-6 hover:bg-orange-500"
            onClick={() =>
              setFilterBy(filterBy === "Flagged" ? null : "Flagged")
            }
          >
            <Flag className="mr-2" /> Flagged: {flagCount["Flagged"] || 0}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link to={`/editstudy/`}>
            <Button className="bg-violet-900 text-violet-50 font-bold text-xl p-6 hover:bg-violet-950">
              <BookText className="mr-2" /> Create Study
            </Button>
          </Link>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-900 text-violet-50 font-bold text-xl p-6 hover:bg-violet-950">
                <Upload className="mr-2" /> Import Studies
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-violet-50">
              <DialogHeader>
                <DialogTitle>Import Studies</DialogTitle>
                <DialogDescription>
                  Upload a JSON file to import studies, tags and authors.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4 bg-violet">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                {importFile && (
                  <div className="flex items-center gap-2 text-sm text-violet-700">
                    <FileUp size={16} />
                    <span>{importFile.name}</span>
                  </div>
                )}
              </div>
              <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
                <Button
                  variant="outline"
                  onClick={() => setImportOpen(false)}
                  className="border-violet-700 text-violet-700 hover:bg-violet-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImportSubmit}
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                >
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-900 text-violet-50 text-xl font-bold p-6 hover:bg-violet-950">
                <Download className="mr-2" /> Export Studies
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-violet-50">
              <DialogHeader>
                <DialogTitle>Export Studies</DialogTitle>
                <DialogDescription>
                  Download a JSON file with data on authors, tags and studies
                  for this review.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
                <Button
                  variant="outline"
                  onClick={() => setExportOpen(false)}
                  className="border-violet-700 text-violet-700 hover:bg-violet-200"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleExportJSON}
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                >
                  Export as JSON
                </Button>
                <Button
                  onClick={handleExportCSV}
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                >
                  Export as CSV
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={studyOpen} onOpenChange={setStudyOpen}>
  <DialogContent className="bg-indigo-100 border-violet-200 max-w-3xl !p-8">
    <DialogHeader className="space-y-3">
      <DialogTitle className="font-bold">Study Metadata</DialogTitle>
      <DialogDescription className="text-gray-600">
        Detailed metadata for the selected study.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4 h-[calc(80vh-220px)] overflow-y-auto pr-2">
      {selectedStudyDetail &&
        Object.entries(refineStudy(selectedStudyDetail)).map(([key, value]) => (
          <div key={key} className="mb-2">
            <span className="font-semibold">{labelMap[key] || key}:</span>{" "}
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
              <span>{String(value)}</span>
            )}
          </div>
        ))}
    </div>

    <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
      <Button
        variant="outline"
        onClick={() => setStudyOpen(false)}
        className="text-violet-700 hover:bg-violet-100"
      >
        Close
      </Button>
      <Link to={`/editstudy/${selectedStudyDetail?.id}/`}>
        <Button className="bg-violet-900 text-violet-50 hover:bg-violet-950 font-bold">
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
                This study is being deleted. This action cannot be undone.
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
        </div>
      </div>
      <div className="h-[calc(100vh-240px)] m-4">
        <DataTable
          columns={columns(setStudyOpen, setSelectedStudy, setDeleteOpen)}
          data={tableData}
          filterBy={filterBy}
        />
      </div>
    </div>
  );
}

export default StudyView;
