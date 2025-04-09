import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TagView from './pages/tag_management/TagView';
import Navbar from './components/custom/navbar';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <Navbar />
        <main className="flex-grow overflow-hidden">
          <Routes>
            <Route path="/tags" element={<TagView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

