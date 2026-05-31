@echo off
echo Resetting and reseeding database...
del /f backend\db\sla3li.db 2>nul
cd backend
node --experimental-sqlite db/seed.js
echo Done! Database reset successfully.
pause
