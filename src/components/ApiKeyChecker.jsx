import React, { useState } from 'react';

export default function ApiKeyChecker() {
  const [apiKey, setApiKey] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setTestResult('Please enter an API key');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing...');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Say hello" }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          setTestResult('✅ API Key is working! Response: ' + data.candidates[0].content.parts[0].text);
        } else {
          setTestResult('❌ API Key works but response format is unexpected');
        }
      } else {
        setTestResult(`❌ API Key failed: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`);
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed top-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-50 max-w-md">
      <h3 className="font-bold mb-2">API Key Tester</h3>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="Paste your Gemini API key here"
        className="w-full p-2 border rounded mb-2 text-sm"
      />
      <button
        onClick={testApiKey}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test API Key'}
      </button>
      {testResult && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
          {testResult}
        </div>
      )}
      <div className="mt-2 text-xs text-gray-600">
        Current .env key: {import.meta.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Not set'}
      </div>
    </div>
  );
}


