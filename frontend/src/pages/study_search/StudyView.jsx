import { useEffect, useState } from "react";
import { DataTable } from "@/components/custom/dataTable/data-table";
import { columns } from "@/components/custom/dataTable/columns";
import { Button } from "@/components/ui/button";
import { Download, Upload, BookText, FileUp, Flag, BookOpenCheck, BookOpenText, BookOpen } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Input } from "@/components/ui/input"



function StudyView() {
    const [tableData, setTableData] = useState([]);
    const [importOpen, setImportOpen] = useState(false)
    const [exportOpen, setExportOpen] = useState(false)
    const [importFile, setImportFile] = useState(null)
    const [filterBy, setFilterBy] = useState(null)
    const [flagCount, setFlagCount] = useState([]);

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
      console.log('fetched table data')
    };
    
    useEffect(() => {
      fetchStudyData();
      fetchFlagCount();
    }, []);

    const fetchFlagCount = async () => {
      const response = await fetch("http://localhost:8000/api/flags/count/"); 
      const data = await response.json();
      setFlagCount(data);
      console.log(data)
    };

    const handleImportSubmit = async () => {
      if (!importFile) {
          setImportFile(null);
          return;
      }
  
      try {
          const fileText = await importFile.text(); // Read the file as text
          const jsonData = JSON.parse(fileText);    // Parse JSON content
          console.log("Imported JSON Data:", jsonData);
  
          const response = await fetch("http://localhost:8000/api/import/", {
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
  

      const handleExport = async () => {
        const response = await fetch("http://localhost:8000/api/export/");
        const data = await response.json();
        const json = JSON.stringify(data);
        const blob = new Blob([json],{type:'application/json'})
        const href = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = href;
        link.download = "review_export" + ".json"; //remember to add review name when it exists!
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(href);
        setExportOpen(false);
      }

  

      return (
        <div className="flex flex-col w-full h-full p-4 bg-violet-50 min-h-screen">
          <h1 className="text-2xl font-bold mb-6">Study Manager</h1>
          <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-wrap gap-4">
                    <Button
                    className="bg-emerald-400 text-violet-50 font-bold text-xl p-6 hover:bg-emerald-500"
                    onClick={() => setFilterBy(filterBy === "Reviewed" ? null : "Reviewed")}
                    >
                    <BookOpenCheck className="mr-2" /> Reviewed: {flagCount["Reviewed"] || 0}
                    </Button>
                    <Button
                    className="bg-amber-400 text-violet-50 font-bold text-xl p-6 hover:bg-amber-500"
                    onClick={() => setFilterBy(filterBy === "Pending Review" ? null : "Pending Review")}
                    >
                    <BookOpenText className="mr-2" /> Pending Review: {flagCount["Pending Review"] || 0}
                    </Button>
                    <Button
                    className="bg-red-400 text-violet-50 font-bold text-xl p-6 hover:bg-red-500"
                    onClick={() => setFilterBy(filterBy === "Missing Data" ? null : "Missing Data")}
                    >
                    <BookOpen className="mr-2" /> Missing Data: {flagCount["Missing Data"] || 0}
                    </Button>
                    <Button
                    className="bg-orange-400 text-violet-50 font-bold text-xl p-6 hover:bg-orange-500"
                    onClick={() => setFilterBy(filterBy === "Flagged" ? null : "Flagged")}
                    >
                    <Flag className="mr-2" /> Flagged: {flagCount["Flagged"] || 0}
                    </Button>
                  </div>
              
                  {/* Violet action buttons on the right */}
            <div className="flex flex-wrap gap-4">
              <Button className="bg-violet-900 text-violet-50 font-bold text-xl p-6 hover:bg-violet-950">
                <BookText className="mr-2" /> Create Study
              </Button>
    
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-violet-900 text-violet-50 font-bold text-xl p-6 hover:bg-violet-950">
                    <Upload className="mr-2" /> Import Studies
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-violet-50">
                  <DialogHeader>
                    <DialogTitle>Import Studies</DialogTitle>
                    <DialogDescription>Upload a JSON file to import studies, tags and authors.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-span-4 bg-white">
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
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setImportOpen(false)}
                      className="border-violet-700 text-violet-700 hover:bg-violet-100"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleImportSubmit} className="bg-violet-900 text-violet-50 hover:bg-violet-950">
                      Import
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
    
              <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-violet-900 text-violet-50 text-xl font-bold p-6 hover:bg-violet-950"
                  >
                    <Download className="mr-2" /> Export Studies
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] bg-violet-50">
                  <DialogHeader>
                    <DialogTitle>Export Studies</DialogTitle>
                    <DialogDescription>
                      Download a JSON file with data on authors, tags and studies for this review.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setExportOpen(false)}
                      className="border-violet-700 text-violet-700 hover:bg-violet-100"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleExport} className="bg-violet-900 text-violet-50 hover:bg-violet-950"
                    >
                      Export
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="h-[calc(100vh-200px)] m-4">
            <DataTable columns={columns(fetchStudyData)} data={tableData} filterBy={filterBy} />
          </div>
        </div>
      )
    }
    
    export default StudyView
