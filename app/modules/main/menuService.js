(function () {

	var remote = require('remote');
		Menu = remote.require('menu'),
		MenuItem = remote.require('menu-item'),
		ipc	= require('electron').ipcRenderer,
		dialog = require('electron').remote.dialog;
	var fs = require('fs');
	var dbPath = remote.require('./main').DBPath;

    function menuService(databaseService, $q, notificationService) {
        var vm = this;

        /*--- Menu ---*/
		var template = [
			{
		    	label: 'Options',
		    	submenu: [
		    		{
		    			label: 'New task',
		    			click: function () {
		    				ipc.send('task-window', {mode: 'New'});
		    			}
		    		},
		    		{
		    			label: 'Export list',
		    			click: function () {
		    				dialog.showSaveDialog({
		    					title: 'Export',
		    					filters: [
								    { name: 'JSON', extensions: ['json'] }
								  ]
		    				}, function (filename) {
		    					if (filename) {
		    						return $q(function(resolve, reject) {
		    							resolve(databaseService.exportDB(filename));
		    						})
		    						.then(function() {
		    							notificationService.noteExport();
		    						})
		    						.catch(function(err) {
		    							console.log(err);
		    						});
		    					}
		    				});
		    			}
		    		},
		    		{
		    			label: 'Import list',
		    			click: function () {
		    				dialog.showOpenDialog({
		    					title: 'Import',
		    					properties: [ 'openFile' ],
		    					filters: [
								    { name: 'JSON', extensions: ['json'] }
								  ]
		    				}, function (filename) {
		    					if (filename.length) {
		    						return $q(function(resolve, reject) {
		    							resolve(databaseService.importDB(filename[0]));
		    						})
		    						.then(function() {
		    							notificationService.noteImport();
		    						})
		    						.then(function() {
		    							remote.getCurrentWindow().reload();
		    						})
		    						.catch(function(err) {
		    							console.log(err);
		    						});
		    					}
		    				});
		    			}
		    		}
		    	]
		  	}
		];

		menu = Menu.buildFromTemplate(template);

		Menu.setApplicationMenu(menu);
    }

    menuService.$inject = ['databaseService', '$q', 'notificationService'];

    angular.module('menuService', []).service('menuService', menuService);
})();