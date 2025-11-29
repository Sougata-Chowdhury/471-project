import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Jobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('/api/jobs'); // Adjust the endpoint as needed
                setJobs(response.data);
            } catch (err) {
                setError('Failed to fetch jobs');
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Job Listings</h1>
            <ul>
                {jobs.map((job) => (
                    <li key={job.id} className="border p-4 mb-2 rounded">
                        <h2 className="text-xl font-semibold">{job.title}</h2>
                        <p>{job.description}</p>
                        <a href={job.applyLink} className="text-blue-500">Apply Now</a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Jobs;