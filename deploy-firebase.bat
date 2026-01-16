@echo off
cls
echo ============================================
echo   Firebase Cloud Functions Setup
echo   Real-Time Chatbot with Bing Search
echo ============================================
echo.

echo [1/5] Installing Firebase CLI...
call npm install -g firebase-tools
if errorlevel 1 (
    echo ERROR: Failed to install Firebase CLI
    pause
    exit /b 1
)
echo ✓ Firebase CLI installed
echo.

echo [2/5] Installing function dependencies...
cd functions
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
cd ..
echo ✓ Dependencies installed
echo.

echo [3/5] Firebase Login...
echo Opening browser for authentication...
call firebase login
if errorlevel 1 (
    echo ERROR: Firebase login failed
    pause
    exit /b 1
)
echo ✓ Logged in successfully
echo.

echo ============================================
echo   Get Your FREE Bing API Key
echo ============================================
echo.
echo 1. Open: https://portal.azure.com/
echo 2. Search "Bing Search v7"
echo 3. Create with FREE tier (F1)
echo 4. Copy your API Key
echo.
echo Press any key after you have your Bing API key...
pause >nul
echo.

set /p BING_KEY="Paste your Bing API Key: "
if "%BING_KEY%"=="" (
    echo ERROR: Bing API key is required
    pause
    exit /b 1
)
echo.

echo [4/5] Configuring environment...
(
echo GEMINI_API_KEY=AIzaSyA-RETtGyvxGU6Xf6KB45pDvCzDFiI19C0
echo BING_API_KEY=%BING_KEY%
) > functions\.env
echo ✓ Environment configured
echo.

echo [5/5] Deploying to Firebase...
echo This may take 2-3 minutes...
call firebase deploy --only functions
if errorlevel 1 (
    echo ERROR: Deployment failed
    echo.
    echo Troubleshooting:
    echo - Check if billing is enabled in Firebase Console
    echo - Verify you selected the correct project
    echo - Check logs: firebase functions:log
    pause
    exit /b 1
)
echo.

echo ============================================
echo   ✓ DEPLOYMENT SUCCESSFUL!
echo ============================================
echo.
echo Your chatbot now has real-time responses!
echo.
echo Test these questions:
echo - "Who is the CM of Kerala?"
echo - "Current Prime Minister of India?"
echo - "Latest news about AI?"
echo.
echo Function URL:
echo https://us-central1-career-roadmap-e7b2c.cloudfunctions.net/chatWithGemini
echo.
pause
