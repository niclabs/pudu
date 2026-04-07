/** EditStudyView
 * @description Wrapper View for the edition or creation of a study. 
 * Used when the form for creating or editing a study is diplayed
 * Main functions include:
 * - Handling routes to determine if the view is in "Edit" or "Create" mode based on the "studyid" in the URL parameters
 * - Fetching and verifying the existence of a PDF file associated with an existing study
 * 
 * @requires utils/authservice for making authenticated requests to the backend
 * @requires pages/edit_study/studyForm the form component used for creating or editing a study
 * @component
 * @returns {JSX.Element} The rendered "Edit Study" view 
*/

"use client";
import { AuthService } from "../../utils/authservice";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import StudyForm from "./studyForm";

function EditStudyView() {
  const params = useParams();
  const [fileUrl, setFileUrl] = useState("");
  const reviewId = sessionStorage.getItem('review_id');

  const fetchPDFPath = async (id) => {
    const response = await AuthService.fetchWithAuth(`http://localhost:8000/api/studies/${id}?review_id=${reviewId}`);
    const data = await response.json();

    if (data.pathto_pdf) {
      const filePath = data.pathto_pdf.startsWith("/")
        ? data.pathto_pdf
        : `/${data.pathto_pdf}`;

      try {
        const headResponse = await AuthService.fetchWithAuth(filePath, { method: "HEAD" });
        const contentType = headResponse.headers.get("Content-Type");
        const contentLength = headResponse.headers.get("Content-Length");

        if (
          headResponse.ok &&
          contentType === "application/pdf" &&
          contentLength !== "0"
        ) {
          setFileUrl(filePath);
        } else {
          console.warn(
            "PDF file does not exist or invalid file type:",
            filePath,
          );
          setFileUrl("");
        }
      } catch (error) {
        console.error("Error checking PDF file existence:", error);
        setFileUrl("");
      }
    } else {
      setFileUrl("");
    }
  };

  useEffect(() => {
    if (params.studyid) {
          fetchPDFPath(params.studyid);
        }
  }, [params.studyid]);

  function PdfEmbed({ url }) {
    return (
      <iframe
        src={url}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="PDF Viewer"
      />
    );
  }

  return (
    <div className="flex flex-row h-screen bg-violet-50">
      <div className="flex-grow overflow-auto h-full">
        <StudyForm
          studyid={params.studyid}
          refreshPdf={() => fetchPDFPath(params.studyid)}
        />
      </div>
      {fileUrl && (
        <div className=" w-2/4 h-full">
          <PdfEmbed url={fileUrl} />
        </div>
      )}
    </div>
  );
}

export default EditStudyView;
