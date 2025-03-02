import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import ChoiceScreen from "./pages/ChoiceScreen";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/create" element={<ChoiceScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
