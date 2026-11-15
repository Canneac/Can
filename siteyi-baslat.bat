@echo off
rem NUVESSA'yi bilgisayarda acar: bu dosyaya cift tiklayin. Pencereyi KAPATMAYIN; site pencere acik kaldigi surece calisir.
cd /d "%~dp0"
echo NUVESSA baslatiliyor... Tarayicida su adresi acin: http://localhost:3000
echo Yonetici paneli: http://localhost:3000/admin/login  (parola .env.local dosyasinda)
start "" http://localhost:3000
call npm run dev
pause
