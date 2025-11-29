import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold">BracuNet</h1>
                <nav>
                    <ul className="flex space-x-4">
                        <li><a href="/" className="hover:underline">Home</a></li>
                        <li><a href="/alumni" className="hover:underline">Alumni</a></li>
                        <li><a href="/events" className="hover:underline">Events</a></li>
                        <li><a href="/jobs" className="hover:underline">Jobs</a></li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;