@echo off
echo ========================================
echo   Deploying Mentor Chatbot
echo ========================================
echo.

echo [1/3] Installing backend dependencies...
cd functions
call npm install @google/generative-ai cors
cd ..

echo.
echo [2/3] Deploying Firebase Function...
call firebase deploy --only functions

echo.
echo [3/3] Done!
echo.
echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Copy your function URL from above
echo 2. Open: src\components\ResponsiveMentorChat.jsx
echo 3. Replace FUNCTION_URL with your URL
echo 4. Run: npm run dev
echo.
echo ========================================
pause
