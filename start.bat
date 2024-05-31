@echo off
setlocal

rem Change to backend directory and start the server
cd /d "C:\Program Files\cpp\oop\cppcode\PaperManagement\webapp\backend"
start cmd /k "npx nodemon server.js"

rem Wait for 5 seconds to ensure the backend server starts
timeout /t 5 /nobreak

rem Change to frontend directory and start the front-end server
cd /d "C:\Program Files\cpp\oop\cppcode\PaperManagement\webapp\frontend"
start cmd /k "npm start"

endlocal
