import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "./pages/MainMenu";
import StoryScreen from "./pages/StoryScreen";
import LoginScreen from "./pages/LoginScreen";
import { createClient, Session } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import supabase from "./lib/supabase";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/create" element={<StoryScreen />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </Router>
  );
};

export default App;
