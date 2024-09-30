import React, { useState, useEffect } from "react";

function App() {
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("");
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("");
  const [regionName, setRegionName] = useState("");
  const [regions, setRegions] = useState([]);  
  const [loading, setLoading] = useState(false);
  const [suggestedIps, setSuggestedIps] = useState([]);
  const [allocatedIps, setAllocatedIps] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch("https://backend-ip-gsje.onrender.com/fetch_regions");
        const data = await response.json();
        setRegions(data);  // Set fetched regions
      } catch (error) {
        console.error("Error fetching regions:", error);
      }
    };

    fetchRegions();
  }, []);  // Empty dependency array to run on component mount

  const handleAllocateIp = async () => {
    setResult(null);
    setLoading(true);
    setSuggestedIps([]);
    setAllocatedIps([]);

    try {
      const response = await fetch("https://backend-ip-gsje.onrender.com/allocate-ip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aws_access_key_id: awsAccessKeyId,
          aws_secret_access_key: awsSecretAccessKey,
          region_name: regionName
        }),
      });

      if (!response.body) {
        throw new Error("Readable stream not supported in this browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // Read the stream in chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the current chunk of the stream
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        // Process each line of the streamed data
        lines.forEach((line) => {
          const ipMatch = line.match(/\d+\.\d+\.\d+\.\d+/); // Match IP addresses (IPv4 format)
          if (ipMatch) {
            if (line.includes("Suggested")) {
              setSuggestedIps((prev) => [...prev, ipMatch[0]]); // Add only IP
            } else if (line.includes("Allocated")) {
              setAllocatedIps((prev) => [...prev, ipMatch[0]]); // Add only IP
            }
          }
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleStopProcess = async () => {
    try {
      const response = await fetch("https://backend-ip-gsje.onrender.com/stop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(data);
      setResult(data);
      setLoading(false);
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

        {/* Dropdown for selecting region */}
        <div className="mb-4">
          <select
            placeholder="Region"
            value={regionName}
            onChange={(e) => setRegionName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>Select Region</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>
                {region}
              </option>
            ))}
          </select>
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

        {!result && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Results</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Suggested IPs</h3>
                <ul className="bg-gray-200 p-2 rounded-lg text-gray-700 overflow-y-auto h-32">
                  {suggestedIps.map((ip, index) => (
                    <li key={index}>{ip}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800">Allocated IPs</h3>
                <ul className="bg-gray-200 p-2 rounded-lg text-gray-700 overflow-y-auto h-32">
                  {allocatedIps.map((ip, index) => (
                    <li key={index}>{ip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
