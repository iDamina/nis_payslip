// src/pages/Forbidden.jsx
import { Link } from 'react-router-dom';

const Forbidden = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center px-4">
      <h1 className="text-5xl text-red-600 font-bold mb-4">403</h1>
      <h2 className="text-2xl text-gray-800 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        You do not have permission to view this page.
      </p>
      <Link
        to="/"
        className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default Forbidden;