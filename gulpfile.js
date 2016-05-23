var gulp = require('gulp');
var winInstaller = require('electron-windows-installer');
 
gulp.task('create-windows-installer', function(done) {
  winInstaller({
    appDirectory: './dist/todotron-win32-x64',
    outputDirectory: './release',
	authors: 'Me Corp',
	exe: 'todotron.exe',
	description: 'First installer',
	version: '0.1.0',
	iconUrl: 'https://raw.githubusercontent.com/atom/electron/master/atom/browser/resources/win/atom.ico'
  }).then(done).catch(done);
});