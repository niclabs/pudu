import { useEffect, useState } from "react";
import { DataTable } from "@/components/custom/dataTable/data-table";
import { columns } from "@/components/custom/dataTable/columns";
import { Button } from "@/components/ui/button";
import { AiOutlineDownload , AiOutlineUpload } from "react-icons/ai";
import { Download, Upload, BookText } from "lucide-react"



function StudyView() {
    const [tableData, setTableData] = useState([]);

    const fetchStudyData = async () => {
        const response = await fetch("http://localhost:8000/api/studies/");
        const data = await response.json();
      
        const refineTable = data.map((study) => ({
          id: study.id,
          title: study.title,
          year: study.year,
          authors: study.authors_display.join(", "),
          categorized: study.categorized ? "Yes" : "No",
          tags: study.tags_display.map((tag) => tag.name).join(", "),
        }));
        setTableData(refineTable);
        console.log('fetched table data')
      };
    
      useEffect(() => {
        fetchStudyData();
    }, []);

    return (
        <div className="flex flex-col w-full h-full p-4 bg-violet-50">
            <div>
                <Button className="bg-violet-900 text-violet-50 font-bold text-xl m-4 p-6 hover:bg-violet-950">
                   <BookText className="mr-2"/> Create Study
                </Button>
                <Button className="bg-violet-900 text-violet-50 font-bold text-xl m-4 p-6 hover:bg-violet-950">
                    <Upload className="mr-2" /> Import Studies
                </Button>
                <Button className="bg-violet-900 text-violet-50 text-xl font-bold m-4 p-6 hover:bg-violet-950">
                    <Download className="mr-2" /> Export Studies
                </Button>
            </div>
            <div className="h-[calc(100vh-100px)] m-4">
                <DataTable columns={columns(fetchStudyData)} data={tableData} />
            </div>
        </div>
    )
}

export default StudyView;
