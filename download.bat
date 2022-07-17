@echo off

if not exist .\marked.min.js (
powershell -command "& { iwr https://cdn.jsdelivr.net/npm/marked/marked.min.js -OutFile .\marked.min.js }"
echo Download marked.min.js complete.
)

if not exist .\default.min.css (
powershell -command "& { iwr https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.5.0/build/styles/default.min.css -OutFile .\default.min.css }"
echo Download default.min.css complete.
)

if not exist .\highlight.min.js (
powershell -command "& { iwr https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.5.0/build/highlight.min.js -OutFile .\highlight.min.js }"
echo Download highlight.min.js complete.
)

