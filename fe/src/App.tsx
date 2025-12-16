import React from "react"
import { BrowserRouter  as Router, Routes, Route } from "react-router-dom"
import Login from "./page/login/login"
import Register from "./page/register/register"
import Home from "./page/home/home"
import Layout from "./layout/layout"
import Store from "./page/store/store"
import StoreAdmin from "./page/store/storeAdmin"
import Score from "./page/Score/score"
import Task from "./page/Task/task"
import Leaderboard from "./page/Task/leaderboard"
import NewTask from "./page/NewTask/newTask"
import Profile from "./page/profile/profile"
import FolderDetail from "./page/Folder/folderDetail"
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home/>}/>
          <Route path="/score" element={<Score />} />
          <Route path="/store" element={<Store />} />
          <Route path="/store_admin" element={<StoreAdmin />} />
          <Route path="/task/:id" element={<Task />} />
          <Route path="/task/:id/leaderboard" element={<Leaderboard />} />
          <Route path="/task_management" element={<NewTask />} />
          <Route path="/profile" element={<Profile/>}/>
          <Route path="/folder/:id" element={<FolderDetail />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App