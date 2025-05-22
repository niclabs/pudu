import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TagView from './pages/tag_management/TagView';
import Navbar from './components/custom/navbar';
import StudyView from './pages/study_search/StudyView';
import EditStudyView from './pages/edit_study/EditStudyView';
import SysRevView from './pages/reviews/SysRevView';
export default function App() {
  return (
    <Router>
      <title>pudu</title>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-grow overflow-hidden">
          <Routes>
            <Route path = "/" element={<SysRevView/>} />
            <Route path="/tags" element={<TagView />} />
            <Route path="/studies" element={<StudyView />} />
            <Route path="/editstudy/" element={<EditStudyView />} />
            <Route path="/editstudy/:studyid" element={<EditStudyView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

