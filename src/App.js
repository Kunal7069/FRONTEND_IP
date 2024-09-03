import React, { useState } from "react";

function App() {
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAllocateIp = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("https://backend-ip-3.onrender.com/allocate-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aws_access_key_id: awsAccessKeyId,
          aws_secret_access_key: awsSecretAccessKey,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStopProcess = async () => {
    try {
      const response = await fetch("https://backend-ip-3.onrender.com/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Elastic IP Allocation
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="AWS Access Key ID"
            value={awsAccessKeyId}
            onChange={(e) => setAwsAccessKeyId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="AWS Secret Access Key"
            value={awsSecretAccessKey}
            onChange={(e) => setAwsSecretAccessKey(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAllocateIp}
          disabled={loading}
          className={`w-full py-2 rounded-lg mb-4 ${
            loading ? "bg-blue-300" : "bg-blue-500 hover:bg-blue-600"
          } text-white font-semibold`}
        >
          {loading ? "Allocating..." : "Allocate IP"}
        </button>

        <button
          onClick={handleStopProcess}
          disabled={!loading}
          className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
        >
          Stop Process
        </button>

        {result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Result</h2>
            <pre className="bg-gray-200 p-2 rounded-lg text-gray-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
