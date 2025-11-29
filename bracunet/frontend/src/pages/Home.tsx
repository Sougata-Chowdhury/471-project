import React from 'react';

const Home: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-center mb-4">Welcome to BracuNet</h1>
            <p className="text-lg text-center mb-8">
                Connect with fellow alumni, explore events, and stay updated with the latest news.
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Get Started
            </button>
        </div>
    );
};

export default Home;