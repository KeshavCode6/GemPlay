import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import StoryScreen from "./pages/StoryScreen";
import LoginScreen from "./pages/LoginScreen";
import HelpScreen from "./pages/HelpScreen";
import ExportScreen from "./pages/ExportScreen";
import { RecordingProvider } from "./lib/recorder";

const App = () => {
  return (
    <RecordingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/create" element={<StoryScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/help" element={<HelpScreen />} />
          <Route path="/export" element={<ExportScreen />} />
        </Routes>
      </Router>
    </RecordingProvider>
  );
};

export default App;
