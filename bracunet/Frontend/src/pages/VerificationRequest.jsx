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
import resourceApi from "../api/resourceApi";

const VerificationRequest = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file");
      return;
    }
    // file upload logic
  };

  return (
    <form onSubmit={handleUpload}>
      <input
        type="text"
        placeholder="Resource Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button type="submit">Upload</button>
    </form>
  );
};


// export default VerificationRequest;

// export default UploadResourcePage;
export { UploadResourcePage as VerificationRequest };

