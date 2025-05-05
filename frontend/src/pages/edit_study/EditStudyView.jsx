import { useParams } from "react-router";

function EditStudyView() {
    const params = useParams();
    console.log(params.studyid)
  }
export default EditStudyView
