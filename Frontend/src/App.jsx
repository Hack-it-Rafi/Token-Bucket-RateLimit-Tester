import { useState } from 'react'
import './App.css'

function App() {
  const [responses, setResponses] = useState([]);
  const [numRequests, setNumRequests] = useState(1);
  
  const sendRequests = async () => {
    const requestArray = Array.from({ length: numRequests }, (_, i) => i);
    const promises = requestArray.map(async () => {
      const response = await fetch("http://localhost:3000/api/data", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log(response);
      return data;
    });
    
    // Wait for all requests to complete
    const results = await Promise.all(promises);
    setResponses(results);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Rate Limiter Tester</h1>
      <div className="card p-4 border rounded shadow-md w-full max-w-md">
        <input
          type="number"
          value={numRequests}
          onChange={(e) => setNumRequests(Number(e.target.value))}
          placeholder="Enter number of requests"
          className="p-2 border rounded w-full mb-4"
        />
        <button
          onClick={sendRequests}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Send Requests
        </button>
      </div>
      <div className="mt-6 w-full max-w-md">
        <h2 className="text-lg font-semibold">Responses:</h2>
        <ul className="space-y-2 mt-2">
          {responses.map((response, index) => (
            <li key={index} className="p-2 border rounded bg-gray-100">
              {JSON.stringify(response.message)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
