import { useEffect, useState } from "react";
import { DataTable } from "@/components/custom/dataTable/data-table";
import { columns } from "@/components/custom/dataTable/columns";

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
        <div className="flex flex-col w-full h-full bg-violet-50">
            hola worlt
            <div> 
                <DataTable columns={columns(fetchStudyData)} data={tableData} />
            </div>
        </div>

    )
}

export default StudyView;
