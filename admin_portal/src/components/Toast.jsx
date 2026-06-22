import React from 'react';

export default function Toast({ error, successMessage, setError, setSuccessMessage }) {
  return (
    <>
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 m-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 m-4 rounded-lg flex justify-between items-center">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')}>✕</button>
        </div>
      )}
    </>
  );
}