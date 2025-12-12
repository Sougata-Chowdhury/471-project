// import { useState } from "react";
// import resourceApi from "../api/resourceApi";

// function UploadResourcePage() {
//   const [file, setFile] = useState(null);
//   const [title, setTitle] = useState("");

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     if (!proofFile) {
//       setError('Please upload a proof document (ID card, gradesheet, or relevant document)');
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append('requestType', formData.requestType);
//       formDataToSend.append('studentId', formData.studentId);
//       formDataToSend.append('department', formData.department);
//       formDataToSend.append('batch', formData.batch);
//       formDataToSend.append('graduationYear', formData.graduationYear);
//       formDataToSend.append('officialEmail', formData.officialEmail);
//       formDataToSend.append('additionalInfo', formData.additionalInfo);
//       formDataToSend.append('proofDocument', proofFile);

//       const response = await fetch('/api/verification/request', {
//         method: 'POST',
//         credentials: 'include',
//         body: formDataToSend,
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to submit verification request');
//       }

//       setSuccess('Verification request submitted successfully! An admin will review it soon.');
//       setTimeout(() => navigate('/dashboard'), 2000);
//     } catch (err) {
//       alert("Upload failed");
//       console.log(err);
//     }
//   };

//   return (
//     <form onSubmit={handleUpload}>
//       <input
//         type="text"
//         placeholder="Resource Title"
//         onChange={(e) => setTitle(e.target.value)}
//       />
//       <input
//         type="file"
//         onChange={(e) => setFile(e.target.files[0])}
//       />
//       <button type="submit">Upload</button>
//     </form>
//   );
// }
// // export { VerificationRequest };
// export default UploadResourcePage;


import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const VerificationRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [proofFile, setProofFile] = useState(null);
  
  const [formData, setFormData] = useState({
    requestType: user?.role || 'student',
    studentId: '',
    department: '',
    batch: '',
    graduationYear: '',
    officialEmail: '',
    additionalInfo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (!proofFile) {
      setError('Please upload a proof document (ID card, gradesheet, or relevant document)');
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('requestType', formData.requestType);
      formDataToSend.append('studentId', formData.studentId);
      formDataToSend.append('department', formData.department);
      formDataToSend.append('batch', formData.batch);
      formDataToSend.append('graduationYear', formData.graduationYear);
      formDataToSend.append('officialEmail', formData.officialEmail);
      formDataToSend.append('additionalInfo', formData.additionalInfo);
      formDataToSend.append('proofDocument', proofFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/verification/request', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit verification request');
      }

      setSuccess('Verification request submitted successfully! An admin will review it soon.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit verification request');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Verification Request</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Request Type</label>
              <select
                value={formData.requestType}
                onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled
              >
                <option value="student">Student</option>
                <option value="alumni">Alumni</option>
                <option value="faculty">Faculty</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">Based on your registered role: {user?.role}</p>
            </div>

            {(formData.requestType === 'student' || formData.requestType === 'alumni') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., 20101234"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="e.g., CSE, EEE, BBA"
              />
            </div>

            {(formData.requestType === 'student' || formData.requestType === 'alumni') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                <input
                  type="text"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Spring 2020"
                />
              </div>
            )}

            {formData.requestType === 'alumni' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year *</label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., 2024"
                />
              </div>
            )}

            {formData.requestType === 'faculty' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Official Email *</label>
                <input
                  type="email"
                  value={formData.officialEmail}
                  onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., faculty@bracu.ac.bd"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proof Document * (ID card, gradesheet, or certificate)</label>
              <input
                type="file"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                accept="image/*,.pdf"
              />
              <p className="text-sm text-gray-500 mt-1">Upload your ID card, gradesheet, or official document</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Information</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Any additional information you'd like to provide"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequest;
