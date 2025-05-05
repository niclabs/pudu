import { useParams } from "react-router";
import MyForm from "./studyForm";

function EditStudyView() {
    const params = useParams();
    console.log(params.studyid)
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 bg-gray-200">
                <h1 className="text-xl font-bold">Edit Study</h1>
            </div>
            <div className="flex-grow p-4 overflow-auto">
                <MyForm />
            </div>
        </div>
    );

  }
export default EditStudyView



