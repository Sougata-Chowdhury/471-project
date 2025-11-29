import React from 'react';

interface ProfileCardProps {
    name: string;
    graduationYear: number;
    degree: string;
    bio: string;
    profilePicture: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, graduationYear, degree, bio, profilePicture }) => {
    return (
        <div className="max-w-sm rounded overflow-hidden shadow-lg">
            <img className="w-full" src={profilePicture} alt={`${name}'s profile`} />
            <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">{name}</div>
                <p className="text-gray-700 text-base">
                    {degree} - Class of {graduationYear}
                </p>
                <p className="text-gray-700 text-base">{bio}</p>
            </div>
        </div>
    );
};

export default ProfileCard;