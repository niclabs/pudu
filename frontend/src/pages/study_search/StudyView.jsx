/** StudyView.jsx
 * @description This file displays the main interface for managing studies within a review. Used for the "Studies" page of the navbar of the application.
 * Main functions include:
 * - Fetching and displaying study data in a table format (using the `<DataTable />` custom component)
 * - Filtering studies based on their review status (Reviewed, Pending Review, Missing Data, Flagged)
 * - Importing studies from a JSON file and exporting studies to JSON or CSV formats
 * 
 * @requires components/custom/dataTable/data-table the custom data table used to display studies
 * @requires utils/authservice for making authenticated requests to the backend
 * @returns {JSX.Element} The rendered "Studies" view.
 */


import { AuthService } from "../../utils/authservice";
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
import { Toaster, toast } from 'sonner'

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

  const reviewId = sessionStorage.getItem('review_id');

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
      notes: study.summary,
    }));
    setTableData(refineTable);
  };

  const deleteStudyData = async (id) => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/studies/${id}/?review_id=${reviewId}`, {
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
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/studies/${id}/?review_id=${reviewId}`);
    const data = await response.json();
    setSelectedStudyDetail(data);
  };

  useEffect(() => {
    fetchStudyData();
    fetchFlagCount();
    if ((studyOpen || deleteOpen) && selectedStudy) {
      fetchStudyDetailed(selectedStudy);
    }
  }, [studyOpen, selectedStudy]);

  const fetchFlagCount = async () => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/flags/count/?review_id=${reviewId}`);
    const data = await response.json();
    setFlagCount(data);
  };

  const handleImport = async () => {
    if (!importFile) {
      setImportFile(null);
      return;
    }

    try {

      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('format', fileExtension);

      const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/import/?review_id=${reviewId}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      toast.success("Studies imported successfully");
    } catch (error) {
      console.error("Failed to read, parse, or submit the file:", error);
    }

    fetchStudyData();
    fetchFlagCount();

    setImportFile(null);
    setImportOpen(false);
  };

  const handleExport = async (format) => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/export_${format}/?review_id=${reviewId}`);

    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = href;
    const reviewName = (sessionStorage.getItem("review_name") || `review_${reviewId}`).replace(/[/\\?%*:|"<>]/g, "_");
    toast.success("Studies exported successfully");
    link.download = `${reviewName}.${format}`;
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
    setExportOpen(false);
  }

  return (
    <div className="flex flex-col w-full p-4 bg-violet-50 h-[calc(100vh-64px)]">
      <h1 className="text-4xl font-bold">Studies</h1>
      <p className=" text-gray-600 mb-6">Browse and manage studies in your review.</p>
      <div className="flex justify-between items-start">
        <div className="flex flex-wrap gap-4">
          <Button
            className="bg-emerald-400 text-violet-50 font-bold text-sm px-3 py-2 hover:bg-emerald-500"
            onClick={() =>
              setFilterBy(filterBy === "Reviewed" ? null : "Reviewed")
            }
          >
            <BookOpenCheck className="mr-2" /> Reviewed:{" "}
            {flagCount["Reviewed"] || 0}
          </Button>
          <Button
            className="bg-cyan-500 text-violet-50 font-bold text-sm px-3 py-2 hover:bg-cyan-600"
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
            className="bg-red-400 text-violet-50 font-bold text-sm px-3 py-2 hover:bg-red-500"
            onClick={() =>
              setFilterBy(filterBy === "Missing Data" ? null : "Missing Data")
            }
          >
            <BookOpen className="mr-2" /> Missing Data:{" "}
            {flagCount["Missing Data"] || 0}
          </Button>
          <Button
            className="bg-orange-400 text-violet-50 font-bold text-sm px-3 py-2 hover:bg-orange-500"
            onClick={() =>
              setFilterBy(filterBy === "Flagged" ? null : "Flagged")
            }
          >
            <Flag className="mr-2" /> Flagged: {flagCount["Flagged"] || 0}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link to={`/editstudy/`}>
            <Button className="bg-violet-900 text-violet-50 font-bold text-sm px-3 py-2 hover:bg-violet-950">
              <BookText className="mr-2" /> Create Study
            </Button>
          </Link>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-900 text-violet-50 font-bold text-sm px-3 py-2 hover:bg-violet-950">
                <Upload className="mr-2" /> Import Studies
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-violet-50">
              <DialogHeader>
                <DialogTitle>Import Studies</DialogTitle>
                <DialogDescription>
                  Upload a JSON, CSV or BibTeX file to import multiple studies, tags and authors.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="col-span-4 bg-violet">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".json, .csv, .bib"
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
                  onClick={handleImport}
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                >
                  Import
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={exportOpen} onOpenChange={setExportOpen}>
            <DialogTrigger asChild>
              <Button className="bg-violet-900 text-violet-50 text-sm font-bold px-3 py-2 hover:bg-violet-950">
                <Download className="mr-2" /> Export Studies
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] bg-violet-50">
              <DialogHeader>
                <DialogTitle>Export Studies</DialogTitle>
                <DialogDescription>
                  Download a file with data on authors, tags and studies
                  for this review.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-3 pt-6 border-t border-violet-200">
                {/* <Button
                  variant="outline"
                  onClick={() => setExportOpen(false)}
                  className="border-violet-700 text-violet-700 hover:bg-violet-200"
                >
                  Cancel
                </Button> */}
                <Button
                  onClick={() => handleExport("json")}
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                >
                  Export as JSON
                </Button>
                <Button
                  onClick={() => handleExport("csv")}
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                >
                  Export as CSV
                </Button>
                <Button
                  onClick={() => handleExport("bib")}
                  className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                >
                  Export as BibTeX
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

              <div style={{ whiteSpace: "pre-line" }} className="space-y-4 py-4 h-[calc(80vh-220px)] overflow-y-auto pr-2">
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
      <div className="h-[calc(100vh-240px)] m-4 overflow-y-auto">
        <DataTable
          columns={columns(setStudyOpen, setSelectedStudy, setDeleteOpen)}
          data={tableData}
          filterBy={filterBy}
        />
      </div>
    </div >
  );
}

export default StudyView;
