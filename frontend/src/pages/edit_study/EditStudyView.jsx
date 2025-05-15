"use client"

import { useParams } from "react-router"
import StudyForm from "./studyForm"

function EditStudyView() {
  const params = useParams()
  const fileUrl = "/Biology-and-Behavior-2016.pdf"

  function PdfEmbed({ url }) {
    return <iframe src={url} width="100%" height="100%" style={{ border: "none" }} title="PDF Viewer" />
  }

  return (
    <div className="flex flex-row h-screen bg-violet-50">
        <div className="flex-grow overflow-auto h-full">
            <StudyForm studyid={params.studyid} />
        </div>
      <div className=" w-2/4 h-full">
          <PdfEmbed url={fileUrl} />
      </div>
      
    </div>
  )
}

export default EditStudyView
