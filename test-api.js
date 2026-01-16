// Test your Gemini API key
// Run this in browser console to test

const testGeminiAPI = async () => {
  const API_KEY = 'AIzaSyArIu1AkBqEQdlVKLkrM0D94Dd3MefSptM';
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Hello, how are you?' }]
        }]
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);
    
    if (data.candidates) {
      console.log('✅ API Working! Response:', data.candidates[0].content.parts[0].text);
    }
  } catch (error) {
    console.error('❌ API Error:', error);
  }
};

// Run the test
testGeminiAPI();