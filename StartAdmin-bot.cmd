@echo off 
@title Admin-bot
start /wait cmd /c "npm install --quiet"
:server
start /wait node index.js
echo (%date%)  -  (%time%) WARNING: Admin bot closed... restarting.
goto server


pause

