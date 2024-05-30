import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import CalcBank from "./pages/CalcBank";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CalcBank />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
