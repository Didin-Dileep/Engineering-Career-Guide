@echo off
echo ========================================
echo   Fixing Database Permissions
echo ========================================
echo.

echo Deploying Realtime Database rules...
firebase deploy --only database

echo.
echo ========================================
echo   Done! Rules updated.
echo ========================================
echo.
echo Now refresh your browser and try again!
echo.
pause
