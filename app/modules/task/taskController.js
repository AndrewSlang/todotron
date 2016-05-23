(function () {
	
	var ipc	= require('electron').ipcRenderer;
	var remote = require('electron').remote;
	var Menu = remote.require('menu');
	var dialog = require('electron').remote.dialog;
	

	function TaskController($scope, $q, databaseService, notificationService) {
		var vm = this;
		vm.$q = $q;
		vm.$scope = $scope;
		vm.databaseService = databaseService;
		vm.notificationService = notificationService;
		ipc.send('current-window', {id: remote.getCurrentWindow().id});
		vm.windowsOptions = ipc.sendSync('get-task-options');
		vm.mode = vm.windowsOptions.mode;
		if (vm.mode === 'Edit' || vm.mode === 'View') {
			var getTask = databaseService.getTask(vm.windowsOptions.taskId);
			vm.task = angular.copy(getTask);
		}
		var InputMenu = Menu.buildFromTemplate([{
		        label: 'Undo',
		        accelerator: 'CommandOrControl+Z',
		        role: 'undo'
		    }, {
		        label: 'Redo',
		        accelerator: 'CommandOrControl+Shift+Z',
		        role: 'redo'
		    }, {
		        type: 'separator'
		    }, {
		        label: 'Cut',
		        accelerator: 'CommandOrControl+X',
		        role: 'cut'
		    }, {
		        label: 'Copy',
		        accelerator: 'CommandOrControl+C',
		        role: 'copy'
		    }, {
		        label: 'Paste',
		        accelerator: 'CommandOrControl+V',
		        role: 'paste'
		    }, {
		        type: 'separator'
		    }, {
		        label: 'Select all',
		        accelerator: 'CommandOrControl+A',
		        role: 'selectall'
		    }
		]);
		document.body.addEventListener('contextmenu', function(e) {
		    e.preventDefault();
		    e.stopPropagation();

		    var node = e.target;

		    while (node) {
		        if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
		            InputMenu.popup(remote.getCurrentWindow());
		            break;
		        }
		        node = node.parentNode;
		    }
		});
	}

	TaskController.prototype.createTask = function (taskData) {
		var vm = this;
		if(!taskData || !taskData.name || !taskData.description) {
			dialog.showMessageBox({
				type: 'warning',
				title: 'Warning',
				message: 'Enter data',
				buttons: ['OK']
			});
		} else {
			return vm.$q(function (resolve, reject) {
				resolve(vm.databaseService.newTask(taskData));
			})
			.then(vm.notificationService.noteNewTask)
			.then(vm.cancel)
			.then(ipc.send('reload-main-window'));
		}
    };

    TaskController.prototype.editTask = function (taskData) {
		var vm = this;
		console.log(taskData);
		if(!taskData.description) {
			dialog.showMessageBox({
				type: 'warning',
				title: 'Warning',
				message: 'Enter description',
				buttons: ['OK']
			});
		} else {
			return vm.$q(function (resolve, reject) {
				resolve(vm.databaseService.updateTask(taskData));
			})
			.then(vm.notificationService.noteEditTask(taskData.name))
			.then(ipc.send('reload-main-window'));
		}
    };

    TaskController.prototype.cancel = function () {
        var vm = this;
        remote.getCurrentWindow().close();
    };

	TaskController.$inject = ['$scope', '$q', 'databaseService', 'notificationService'];

	angular.module('taskController', []).controller('TaskController', TaskController);

}());