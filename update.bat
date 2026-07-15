@echo off
chcp 65001 >nul
title Update Electricity Data

set REPO_DIR=%~dp0
set DATA_FILE=%REPO_DIR%data.json
set PYTHON="C:\Users\dannel\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\vm\tools\python\python.exe"
set GIT="C:\Program Files\Git\cmd\git.exe"

echo ============================================
echo   Electricity Data Updater
echo ============================================
echo.
echo Current data:
type "%DATA_FILE%"
echo.
echo ----------------------------------------
echo.

set /p YEAR="  Year (e.g. 2026): "
set /p MONTH="  Month (1-12): "
set /p KWH="  Electricity (kWh): "
set /p COST="  Cost (Yuan): "
set /p PEAK="  Peak kWh (0 if unknown): "
set /p VALLEY="  Valley kWh (0 if unknown): "
set /p NOTE="  Note (press Enter to skip): "

echo.
echo Updating data.json...

%PYTHON% -c "
import json, sys
f = r'%DATA_FILE%'
data = json.load(open(f, encoding='utf-8'))
year, month = int('%YEAR%'), int('%MONTH%')
found = False
for item in data:
    if item['year'] == year and item['month'] == month:
        item['kwh'] = float('%KWH%')
        item['cost'] = float('%COST%')
        item['peak_kwh'] = float('%PEAK%')
        item['valley_kwh'] = float('%VALLEY%')
        item['note'] = '%NOTE%'
        found = True
        break
if not found:
    data.append({'year': year, 'month': month, 'kwh': float('%KWH%'), 'cost': float('%COST%'), 'peak_kwh': float('%PEAK%'), 'valley_kwh': float('%VALLEY%'), 'note': '%NOTE%'})
data.sort(key=lambda x: (x['year'], x['month']))
json.dump(data, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('Updated!')
"

echo.
echo Committing to git...
cd /d "%REPO_DIR%"
%GIT% add data.json
%GIT% commit -m "update: %YEAR%-%MONTH% data"
%GIT% push origin master

echo.
echo [Done] Data updated and pushed to Gitee!
echo Visit your Gitee Pages to see the dashboard.
pause