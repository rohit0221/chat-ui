import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatApp from "./ChatApp";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ChatApp />} />
        <Route path="/c/:sessionId" element={<ChatApp />} />
      </Routes>
    </Router>
  );
}

export default App;
