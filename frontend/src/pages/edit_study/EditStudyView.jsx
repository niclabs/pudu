"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import StudyForm from "./studyForm";

function EditStudyView() {
  const params = useParams();
  const [fileUrl, setFileUrl] = useState("");
  //const fileUrl = ""

  const reviewId = localStorage.getItem('review_id');

  const fetchPDFPath = async (id) => {
    const response = await fetch(`http://localhost:8000/api/studies/${id}?review_id=${reviewId}`);
    const data = await response.json();

    if (data.pathto_pdf) {
      const filePath = data.pathto_pdf.startsWith("/")
        ? data.pathto_pdf
        : `/${data.pathto_pdf}`;

      try {
        const headResponse = await fetch(filePath, { method: "HEAD" });
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
    fetchPDFPath(params.studyid);
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
