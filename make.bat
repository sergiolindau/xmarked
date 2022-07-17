@echo off
call download.bat
call ts_build.bat
call bundle.bat
start cmd /c "npx http-server -c-1 -p9000"
start chrome "http://127.0.0.1:9000/"