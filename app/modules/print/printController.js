(function () {

	var dialog = require('electron').remote.dialog,
		ipc	= require('electron').ipcRenderer;
	var remote = require('remote'),
		Menu = remote.require('menu'),
		MenuItem = remote.require('menu-item'),
		webFrame = require('electron').webFrame;
	var fs = require('fs');

	function PrintController($scope, $q, databaseService, notificationService) {
		var vm = this;
		vm.$scope = $scope;
		vm.databaseService = databaseService;
		vm.$scope.list = databaseService.getTasks();

		var menu = new Menu();
		menu.append(new MenuItem(
			{
    			label: 'File',
		    	submenu: [
		    		{
		    			label: 'Print',
		    			click: function () {
		    				remote.getCurrentWindow().webContents.print();
		    			}
		    		},
		    		{
		    			label: 'Save as PDF',
		    			click: function () {
		    				dialog.showSaveDialog({
		    					title: 'Save as PDF',
		    					filters: [
								    { name: 'PDF', extensions: ['pdf'] }
								  ]
		    				}, function (filename) {
		    					if (filename) {
		    						return $q(function(resolve, reject) {
		    							resolve(remote.getCurrentWindow().webContents.printToPDF({}, function(error, data) {
								        	if (error) throw error;
									        fs.writeFile(filename, data, function(error) {
									            if (error) throw error;
									        })
									    }));
		    						})
		    						.then(function() {
		    							notificationService.notePrint();
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
		));
		menu.append(new MenuItem(
			{
	    		label: 'Zoom',
	    		submenu: [
	    			{
		    			label: 'Zoom 50%',
		    			enabled: true,
		    			click: function () {
		    				webFrame.setZoomFactor(0.5);
		    				menu.items[1].submenu.items[0].enabled = false;
		    				menu.items[1].submenu.items[1].enabled = true;
		    				menu.items[1].submenu.items[2].enabled = true;
		    			}
		    		},
		    		{
		    			label: 'Default',
		    			enabled: false,
		    			click: function () {
		    				webFrame.setZoomFactor(1.0);
		    				menu.items[1].submenu.items[0].enabled = true;
		    				menu.items[1].submenu.items[1].enabled = false;
		    				menu.items[1].submenu.items[2].enabled = true;
		    			}
		    		},
		    		{
		    			label: 'Zoom 150%',
		    			enabled: true,
		    			click: function () {
		    				webFrame.setZoomFactor(1.5);
		    				menu.items[1].submenu.items[0].enabled = true;
		    				menu.items[1].submenu.items[1].enabled = true;
		    				menu.items[1].submenu.items[2].enabled = false;
		    			}
		    		}
	    		]
	    	}
		));

		if (process.platform != 'darwin') {
			remote.getCurrentWindow().setMenu(menu);
		} else {
			window.addEventListener('contextmenu', function (e) {
			  	e.preventDefault();
			  	menu.popup(remote.getCurrentWindow());
			}, false);
		}
	}

	PrintController.prototype.renderTasks = function () {
		var vm = this;
		vm.$scope.list = vm.databaseService.getTasks();
		vm.$scope.$apply();
	};

	PrintController.$inject = ['$scope', '$q', 'databaseService', 'notificationService'];

	angular.module('printController', []).controller('PrintController', PrintController);

}());