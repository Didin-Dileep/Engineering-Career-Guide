@echo off
echo ========================================
echo  Real-Time Chatbot Setup
echo ========================================
echo.

echo Step 1: Installing Firebase CLI...
call npm install -g firebase-tools
echo.

echo Step 2: Installing function dependencies...
cd functions
call npm install
cd ..
echo.

echo Step 3: Logging into Firebase...
call firebase login
echo.

echo ========================================
echo IMPORTANT: Get your Bing API Key
echo ========================================
echo.
echo 1. Go to: https://portal.azure.com/
echo 2. Search "Bing Search v7"
echo 3. Create FREE tier (F1)
echo 4. Copy your API Key
echo.
set /p BING_KEY="Paste your Bing API Key here: "
echo.

echo Step 4: Setting up environment variables...
(
echo GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
echo BING_API_KEY=%BING_KEY%
) > functions\.env
echo Environment configured!
echo.

echo Step 5: Deploying to Firebase...
call firebase deploy --only functions
echo.

echo ========================================
echo  Setup Complete! 
echo ========================================
echo.
echo Your chatbot now has real-time responses!
echo Test with: "Who is the CM of Kerala?"
echo.
pause
