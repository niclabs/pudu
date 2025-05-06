import { useParams } from "react-router";
import MyForm from "./studyForm";

function EditStudyView() {
    const params = useParams();
    console.log(params.studyid)
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow p-4 overflow-auto">
                <MyForm />
            </div>
        </div>
    );
}
export default EditStudyView;