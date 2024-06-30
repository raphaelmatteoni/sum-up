import './App.css';
import Home from './views/Home/Home';
import BillDetails from './views/BillDetails/BillDetails';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bill-details/:id" element={<BillDetails />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
