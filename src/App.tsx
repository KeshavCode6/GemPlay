import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import StoryScreen from "./pages/StoryScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/create" element={<StoryScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
