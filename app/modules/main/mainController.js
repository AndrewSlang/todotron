(function () {

	var dialog = require('electron').remote.dialog,
		ipc	= require('electron').ipcRenderer;
	var remote = require('remote'),
		Menu = remote.require('menu'),
		MenuItem = remote.require('menu-item');

	function MainController($scope, databaseService, notificationService, menuService) {
		var vm = this;
		vm.$scope = $scope;
		vm.databaseService = databaseService;
		vm.notificationService = notificationService;
		vm.$scope.list = databaseService.getTasks();


		var contextmenu = new Menu();
		contextmenu.append(new MenuItem(
			{
				label: 'About',
				accelerator: 'CommandOrControl+Alt+A',
				click: function () {
					ipc.send('about-window');
				}
			}
		));
		if (process.platform === 'win32') {
			contextmenu.append(new MenuItem(
				{
					label: 'Always show Menu Bar',
					type: 'checkbox',
					checked: true,
					click: function () {
						if (contextmenu.items[1].checked) {
							remote.getCurrentWindow().setMenuBarVisibility(true);
							remote.getCurrentWindow().setAutoHideMenuBar(false);
						} else {
							remote.getCurrentWindow().setMenuBarVisibility(false);
							remote.getCurrentWindow().setAutoHideMenuBar(true);
						}
					}
				}
			));
		}
		contextmenu.append(new MenuItem(
			{
				label: 'Close',
				accelerator: 'CommandOrControl+W',
				role: 'close'
			}
		));
		//console.log(document.getElementsByClassName('taskItem'));
		window.addEventListener('contextmenu', function (e) {
		  	e.preventDefault();
		  	contextmenu.popup(remote.getCurrentWindow());
		}, false);


	}

	MainController.prototype.renderTasks = function () {
		var vm = this;
		vm.$scope.list = vm.databaseService.getTasks();
		vm.$scope.$apply();
	};

	MainController.prototype.viewTask = function (id) {
		var vm = this;
		ipc.send('task-window', {taskId: id, mode: 'View'});
	};

	MainController.prototype.deleteTask = function (id, title) {
		var vm = this;
		dialog.showMessageBox({
			type: 'question',
			title: 'Warning',
			message: 'Are you sure want delete task ' + title + '?',
			buttons: ['Cancel', 'Yes']
		}, function (response) {
			if (response) {
				vm.databaseService.deleteTask(id);
				vm.renderTasks();
				vm.notificationService.noteTask(title);
			}
		});
	};

	MainController.prototype.editTask = function (id) {
		var vm = this;
		ipc.send('task-window', {taskId: id, mode: 'Edit'});
	};

	MainController.$inject = ['$scope', 'databaseService', 'notificationService', 'menuService'];

	angular.module('mainController', []).controller('MainController', MainController);

}());