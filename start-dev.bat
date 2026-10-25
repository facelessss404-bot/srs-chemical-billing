@echo off
title SBR Billing Dev Mode
echo Starting backend server on http://localhost:5000 and frontend on http://localhost:5173...
start cmd /k "node server/src/server.js"
start cmd /k "npm.cmd --prefix app run dev"
echo Both servers launched.
