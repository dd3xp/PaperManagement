@echo off
REM 检查Python是否在PATH中
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    pause
    exit /b 1
)

REM 运行Python脚本
python replace_http_with_https.py
pause
