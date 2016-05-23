var app = require('app'),
	ipc = require("electron").ipcMain,
  Tray = require("tray"),
  Menu = require('menu'),
	BrowserWindow = require('browser-window'),
	path = require('path'),
  globalShortcut = require('global-shortcut'),
  crashReporter = require('electron').crashReporter,
  autoUpdater = require('auto-updater');

var low = require('lowdb');
var storage = require('lowdb/file-sync');
module.exports.DB = low(path.join(__dirname, '../data/tasks.json'), { storage });

module.exports.DBPath = path.join(__dirname, '../data/tasks.json');

app.setName('Todotron');

var mainWindow, aboutWindow, printWindow, appIcon;
var shouldQuit = false;

app.on('window-all-closed', function(){
    if(process.platform != 'darwin')
        app.quit();
});

if (process.platform === 'win32') {
  /*--- Winwows TaskBar ---*/
  app.setUserTasks([
    {
      program: process.execPath,
      arguments: '--new-window',
      iconPath: process.execPath,
      iconIndex: 0,
      title: 'New Window',
      description: 'Create a new window'
    }
  ]);
}

function createAboutWindow () {
  aboutWindow = new BrowserWindow({
    width: 400,
    height: 200,
    show: false,
    icon: __dirname + '/assets/resources/icon.png',
    title: 'Todotron'
  });
  aboutWindow.setMenu(null);

  aboutWindow.loadURL(path.join('file://', __dirname, 'modules/about/about.html'));

  aboutWindow.webContents.on('did-finish-load', function() {
    aboutWindow.show();
  });

  aboutWindow.on('closed', function(event) {
    aboutWindow = null;
  });
}

function createPrintWindow () {
  printWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: __dirname + '/assets/resources/icon.png',
    title: 'Todotron'
  });
  printWindow.setMenu(null);

  printWindow.loadURL(path.join('file://', __dirname, 'modules/print/print.html'));

  printWindow.on('closed', function(event) {
    printWindow = null;
  });
}

crashReporter.start({
  productName: 'Todotron',
  companyName: 'Todotron Inc',
  submitURL: 'http://localhost:1127/',
  autoSubmit: true
});

app.on('ready', function() {

app.setName('Todotron');

  /*--- Shortcut ---*/
  function setShortcut() {
    var kioskMode = globalShortcut.register('CommandOrControl+K', function() {
      if (mainWindow.isKiosk()) {
        mainWindow.setKiosk(false);  
      } else {
        mainWindow.setKiosk(true);
      }
    });
    var aboutWindowShortcut = globalShortcut.register('CommandOrControl+Alt+A', function() {
      if (aboutWindow != null) {
        aboutWindow.focus();
      } else {
        createAboutWindow();
      }
    });
    var closeMainWindowShortcut = globalShortcut.register('CommandOrControl+W', function() {
      if (mainWindow.isVisible()) {
        mainWindow.close();
      }
    });
    var quitAppShortcut = globalShortcut.register('CommandOrControl+Q', function() {
      shouldQuit = true;
      app.quit();
    });
  }
  

  /*--- Tray ---*/
  appIcon = new Tray(__dirname + '/assets/resources/tray-icon.png');
  var contextMenu = Menu.buildFromTemplate([{
      label: 'Open Todotron',
      click: function () {
        if (!mainWindow.isVisible()) {
          mainWindow.show();
          setShortcut();
        } else {
          mainWindow.focus();
        }
      }
    },
    {
      label: 'About',
      accelerator: 'CommandOrControl+Alt+A',
      click: function () {
        if (aboutWindow != null) {
          aboutWindow.focus();
        } else {
          createAboutWindow();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Print...',
      click: function () {
        if (printWindow != null) {
          printWindow.focus();
        } else {
          createPrintWindow();
        }
      }
    },
    {
      label: 'Crash',
      click: function () {
        process.crash();
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'CommandOrControl+Q',
      click: function () {
        shouldQuit = true;
        app.quit();
      }
    }
  ]);
  appIcon.setToolTip('Todotron');
  appIcon.setContextMenu(contextMenu);
  appIcon.on('click', function() {
    if (!mainWindow.isVisible()) {
      setShortcut();
      mainWindow.show();
    } else {
      mainWindow.focus();
    }
  });

  /*--- mainWindow create ---*/
	mainWindow = new BrowserWindow({
  	width: 800,
  	height: 600,
    icon: __dirname + '/assets/resources/icon.png',
    title: 'Todotron'
    //,autoHideMenuBar: true
    //,skipTaskbar: true
	});
  mainWindow.setMenu(null);
  setShortcut();
  
  mainWindow.loadURL(path.join('file://', __dirname, 'modules/index.html'));
  
  /*--- mainWindow button on taskBar ---*/
  mainWindow.setThumbarButtons([
    {
      icon: __dirname + '/assets/resources/power.png',
      click: function () {
        shouldQuit = true;
        app.quit();
      }
    },
    {
      icon: __dirname + '/assets/resources/wrench.png',
      click: function () {
        mainWindow.toggleDevTools();
      }
    }
  ]);

  /*--- about-window create ---*/
	ipc.on('about-window', function () {
    if (aboutWindow != null) {
      aboutWindow.focus();
    } else {
      createAboutWindow();
    }
	});

  ipc.on('task-window', function (event, arg) {
      taskWindow = new BrowserWindow({
        width: 700,
        height: 400,
        icon: __dirname + '/assets/resources/icon.png',
        title: 'Todotron'
      });
      taskWindow.setMenu(null);

      taskWindow.loadURL(path.join('file://', __dirname, 'modules/task/task.html'));
      ipc.once('current-window', function (e, win) {
        BrowserWindow.fromId(win.id).setThumbarButtons([{
            icon: __dirname + '/assets/resources/wrench.png',
            click: function () {
              BrowserWindow.fromId(win.id).toggleDevTools();
            }
          }
        ]);

      });

      ipc.once('get-task-options', function (event) {
        //event.sender.send('set-task-view', arg);
        event.returnValue = arg;
      });

  });

  ipc.on('reload-module-db', function () {
    module.exports.DB = low(path.join(__dirname, '../data/tasks.json'), { storage });
  });

  ipc.on('reload-main-window', function () {
      mainWindow.reload();
  });
  
  mainWindow.on('close', function(event) {
    globalShortcut.unregisterAll();
    if(!shouldQuit) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  app.on('will-quit', function () {
    mainWindow = null;
    aboutWindow = null;
  });

});