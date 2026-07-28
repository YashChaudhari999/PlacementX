@echo off
echo Cleaning up ports...
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5000') DO (
  if "%%T" NEQ "0" taskkill /F /PID %%T >nul 2>&1
)
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5173') DO (
  if "%%T" NEQ "0" taskkill /F /PID %%T >nul 2>&1
)
FOR /F "tokens=5" %%T IN ('netstat -a -n -o ^| findstr :5174') DO (
  if "%%T" NEQ "0" taskkill /F /PID %%T >nul 2>&1
)

echo Installing dependencies...
call npm install
echo Starting PlacementX...
call npm run dev
pause
