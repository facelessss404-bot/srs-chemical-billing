@echo off
title S.B.R. CHEMICALS & OILS - GST BILLING SUITE
color 0C
echo =========================================================================
echo       S.B.R. CHEMICALS & OILS - GST BILLING & CLOUD ERP SUITE
echo             Wholesale & Retail Supplier - Coimbatore
echo =========================================================================
echo.
echo Starting Database Engine & Application Server on port 5000...
echo.

start "" "http://localhost:5000"
node server/src/server.js

pause
