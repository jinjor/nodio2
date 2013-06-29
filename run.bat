call tsc --out bin/app.js --module amd src/app.ts src/models.ts src/views.ts --sourcemap
call jasmine-node rows2obj/spec.js --matchall
node server