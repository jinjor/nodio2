call tsc --out bin/app.js --module amd src/app.ts src/models.ts src/views.ts --sourcemap & if errorlevel 1 goto :EOF
call jasmine-node rows2obj/spec.js --matchall & if errorlevel 1 goto :EOF
node server