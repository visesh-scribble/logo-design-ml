@echo off
title GourmetStudio Pro - Restaurant Branding & Menu Suite
cls
echo =====================================================================
echo                GourmetStudio Pro Enterprise Suite
echo     Automated Restaurant Logo Generator & Digital Menu Board Studio
echo =====================================================================
echo.

set PYTHON_CMD=python
if exist "C:\Users\vises\AppData\Local\Programs\Python\Python314\python.exe" (
    set PYTHON_CMD="C:\Users\vises\AppData\Local\Programs\Python\Python314\python.exe"
)

echo Starting GourmetStudio Pro server...
start "" http://localhost:8080
%PYTHON_CMD% server.py
pause
