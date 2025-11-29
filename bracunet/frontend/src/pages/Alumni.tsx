import React, { useEffect, useState } from 'react';
import { getAlumni } from '../services/api';

const Alumni: React.FC = () => {
    const [alumniList, setAlumniList] = useState([]);

    useEffect(() => {
        const fetchAlumni = async () => {
            try {
                const response = await getAlumni();
                setAlumniList(response.data);
            } catch (error) {
                console.error('Error fetching alumni data:', error);
            }
        };

        fetchAlumni();
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Alumni</h1>
            <ul className="space-y-2">
                {alumniList.map((alumnus) => (
                    <li key={alumnus.id} className="p-4 border rounded shadow">
                        <h2 className="text-xl">{alumnus.name}</h2>
                        <p>{alumnus.email}</p>
                        <p>{alumnus.graduationYear}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Alumni;