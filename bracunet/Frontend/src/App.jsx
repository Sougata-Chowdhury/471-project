// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { Home } from './pages/Home';
// import { Login } from './pages/Login';
// import { Register } from './pages/Register';
// import { Dashboard } from './pages/Dashboard';
// import VerificationRequest from './pages/VerificationRequest';
// import { AdminVerification } from './pages/AdminVerification';
// import { MyVerificationRequests } from './pages/MyVerificationRequests';
// import NewsCategoryPage from "./pages/NewsCategoryPage";
// import NewsList from "./pages/NewsList";
// import AdminNewsModeration from "./pages/AdminNewsModeration";
// // import ForumsPage from './pages/ForumsPage';
// // import ForumDetailPage from './pages/ForumDetailPage';
// // import PostDetailPage from './pages/PostDetailPage';
// // import ResourceList from "./pages/ResourceList";
// import ResourceUpload from "./pages/ResourceUpload";
// import ResourceList from "./pages/ResourceList";
// import { API, setAuthToken } from "./api";
// import './index.css';

// function App() {
//   const token = localStorage.getItem("token");

//   // attach token to axios instance
//   setAuthToken(token);

//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/verification-request" element={<VerificationRequest />} />
//           <Route path="/my-verification-requests" element={<MyVerificationRequests />} />
//           <Route path="/admin/verification" element={<AdminVerification />} />
//           {/* <Route path="*" element={<Navigate to="/" />} /> */}
//           <Route path="/news" element={<NewsList />} />
//           {/* <Route path="/news" element={<NewsList />} /> */}
//           <Route
//             path="/news/university-updates"
//             element={
//               <NewsCategoryPage
//                 title="University Updates"
//                 category="announcement"
//               />
//             }
//           />
//           <Route
//             path="/news/alumni-achievements"
//             element={
//               <NewsCategoryPage
//                 title="Alumni Achievements"
//                 category="achievement"
//               />
//             }
//           />
//           <Route
//             path="/news/upcoming-events"
//             element={
//               <NewsCategoryPage
//                 title="Upcoming Events"
//                 category="event"
//               />
//             }
//           />
//           <Route path="/admin/news" element={<AdminNewsModeration />} />

//           {/* Forums & Resources */}
//           {/* <Route path="/forums" element={<ForumsPage />} />
//           <Route path="/forum/:forumId" element={<ForumDetailPage />} /> */}
//           {/* <Route path="/post/:postId" element={<PostDetailPage />} /> */}

          
          
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </AuthProvider>
    
//     </Router>
//   );
// }

// export default App;


import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import  { Dashboard } from "./pages/Dashboard";
import VerificationRequest from "./pages/VerificationRequest";
import { AdminVerification } from "./pages/AdminVerification";
import { MyVerificationRequests } from "./pages/MyVerificationRequests";
import NewsCategoryPage from "./pages/NewsCategoryPage";
import NewsList from "./pages/NewsList";
import AdminNewsModeration from "./pages/AdminNewsModeration";

import ResourceLibrary from "./pages/ResourceLibrary";
import { setAuthToken } from "./api";
import ForumList from './pages/ForumList';
import ForumDetail from './pages/ForumDetail';

import "./index.css";

function AppContent() {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem("token");
  setAuthToken(token);

  return (
    <div>
      <Routes>
        {/* --- Public Pages --- */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* --- Dashboard / User --- */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/verification-request" element={<VerificationRequest />} />
        <Route path="/my-verification-requests" element={<MyVerificationRequests />} />

        {/* --- Admin --- */}
        <Route path="/admin/verification" element={<AdminVerification />} />
        <Route path="/admin/news" element={<AdminNewsModeration />} />

        {/* --- News --- */}
        <Route path="/news" element={<NewsList />} />
        <Route
          path="/news/university-updates"
          element={<NewsCategoryPage title="University Updates" category="announcement" />}
        />
        <Route
          path="/news/alumni-achievements"
          element={<NewsCategoryPage title="Alumni Achievements" category="achievement" />}
        />
        <Route
          path="/news/upcoming-events"
          element={<NewsCategoryPage title="Upcoming Events" category="event" />}
        />

        {/* --- Resource Library --- */}
        <Route path="/resources" element={<ResourceLibrary />} />
        <Route path="/forum" element={<ForumList />} />
        <Route path="/forum/:forumId" element={<ForumDetail />} />

        {/* --- Fallback --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
