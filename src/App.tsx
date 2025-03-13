import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import StoryScreen from "./pages/StoryScreen";
import LoginScreen from "./pages/LoginScreen";
import HelpScreen from "./pages/HelpScreen";
import ExportScreen from "./pages/ExportScreen";
import SignUpScreen from "./pages/SignUpScreen";
import LibraryScreen from "./pages/LibraryScreen";
import { Toaster } from "./components/ui/sonner";

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/create" element={<StoryScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignUpScreen />} />
          <Route path="/library" element={<LibraryScreen />} />
          <Route path="/help" element={<HelpScreen />} />
          <Route path="/export" element={<ExportScreen />} />
        </Routes>
      </Router>
      <Toaster></Toaster>
    </div>
  );
};

export default App;
