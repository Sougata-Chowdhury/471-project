// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { Home } from './pages/Home';
// import { Login } from './pages/Login';
// import { Register } from './pages/Register';
// import { Dashboard } from './pages/Dashboard';
// import  VerificationRequest  from './pages/VerificationRequest';
// import { AdminVerification } from './pages/AdminVerification';
// import { MyVerificationRequests } from './pages/MyVerificationRequests';
// import NewsCategoryPage from "./pages/NewsCategoryPage";
// import NewsList from "./pages/NewsList";
// import './index.css';

// function AppContent() {
//   const { user } = useContext(AuthContext);
//   const token = localStorage.getItem("token");
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
//           <Route path="*" element={<Navigate to="/" />} />
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }
// export default AppContent;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import VerificationRequest from './pages/VerificationRequest';
import { AdminVerification } from './pages/AdminVerification';
import { MyVerificationRequests } from './pages/MyVerificationRequests';
import NewsCategoryPage from "./pages/NewsCategoryPage";
import NewsList from "./pages/NewsList";
import './index.css';

function AppContent() {
  // সব AuthContext useContext লাইন মুছে দিলাম
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verification-request" element={<VerificationRequest />} />
          <Route path="/my-verification-requests" element={<MyVerificationRequests />} />
          <Route path="/admin/verification" element={<AdminVerification />} />
          <Route path="/news" element={<NewsList />} />
          <Route
            path="/news/university-updates"
            element={
              <NewsCategoryPage title="University Updates" category="announcement" />
            }
          />
          <Route
            path="/news/alumni-achievements"
            element={
              <NewsCategoryPage title="Alumni Achievements" category="achievement" />
            }
          />
          <Route
            path="/news/upcoming-events"
            element={
              <NewsCategoryPage title="Upcoming Events" category="event" />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default AppContent;
