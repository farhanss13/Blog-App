import { Routes, Route } from "react-router-dom";
import AuthForm from "./pages/AuthForm";
import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import AddBlog from "./pages/AddBlog";
import BlogPage from "./pages/BlogPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<NavBar />}>
        <Route index element={<HomePage />} />
        <Route path="add-blog" element={<AddBlog/>}  />
        <Route path="signin" element={<AuthForm type="signin" />} />
        <Route path="signup" element={<AuthForm type="signup" />} />
        <Route path="/blog/:id" element={<BlogPage/>} />
      </Route>
    </Routes>
  );
}

export default App;
