@echo off
rem NUVESSA'yi telefondan denemek icin: bu dosyaya cift tiklayin, ekranda yazan adresi telefonun tarayicisina yazin.
rem Telefon ve bilgisayar AYNI Wi-Fi/agda olmali. Windows guvenlik duvari sorarsa "Ozel aglar" icin izin verin.
cd /d "%~dp0"
call npm run phone
pause
