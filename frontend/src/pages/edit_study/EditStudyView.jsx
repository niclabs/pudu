import { useParams } from "react-router";
import StudyForm from "./studyForm";

function EditStudyView() {
    const params = useParams();

    return (
        <div className="flex flex-col h-full bg-violet-50">
            <div className="flex-grow p-4 overflow-auto">
                <StudyForm studyid={params.studyid} />
            </div>
        </div>
    );
}
export default EditStudyView;