import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateNFT from './pages/CreateNFT';
import SellNFT from './pages/SellNFT';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-800">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateNFT />} />
          <Route path="/sell" element={<SellNFT />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
