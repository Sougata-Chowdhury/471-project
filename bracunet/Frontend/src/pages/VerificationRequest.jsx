import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const VerificationRequest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    requestType: user?.role || 'student',
    studentId: '',
    department: '',
    batch: '',
    graduationYear: '',
    officialEmail: '',
    additionalInfo: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, JPG, PNG, and PDF files are allowed');
        e.target.value = '';
        return;
      }
      setProofFile(file);
      setError('');
    }
  };

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

      const response = await fetch('/api/verification/request', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit verification request');
      }

      setSuccess('Verification request submitted successfully! An admin will review it soon.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verification Request</h1>
          <p className="text-gray-600 mb-6">
            Submit your information to get verified and access full features
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Request Type</label>
              <input
                type="text"
                value={formData.requestType.charAt(0).toUpperCase() + formData.requestType.slice(1)}
                disabled
                className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 cursor-not-allowed"
              />
              <p className="text-gray-500 text-sm mt-1">
                Verification type is locked to your registered role
              </p>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Proof Document <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-sm mt-1">
                Upload your ID card, gradesheet, or relevant document (JPEG, PNG, PDF - Max 5MB)
              </p>
              {proofFile && (
                <p className="text-green-600 text-sm mt-2">
                  ✓ Selected: {proofFile.name}
                </p>
              )}
            </div>

            {(formData.requestType === 'student' || formData.requestType === 'alumni') && (
              <>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Student ID</label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 20101234"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Batch</label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Spring 2020"
                  />
                </div>
              </>
            )}

            {formData.requestType === 'alumni' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2024"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Computer Science and Engineering"
              />
            </div>

            {formData.requestType === 'faculty' && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Official Email (@bracu.ac.bd)
                </label>
                <input
                  type="email"
                  name="officialEmail"
                  value={formData.officialEmail}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@bracu.ac.bd"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Additional Information (Optional)
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information that might help with verification..."
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Verification Request'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg transition"
            >
              Back to Dashboard
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
