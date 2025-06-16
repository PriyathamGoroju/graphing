import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GraphingTool from './pages/GraphingTool';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GraphingTool />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
