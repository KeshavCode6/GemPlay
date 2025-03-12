import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import StoryScreen from "./pages/StoryScreen";
import LoginScreen from "./pages/LoginScreen";
import HelpScreen from "./pages/HelpScreen";
import ExportScreen from "./pages/ExportScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/create" element={<StoryScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/help" element={<HelpScreen />} />
        <Route path="/export" element={<ExportScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
