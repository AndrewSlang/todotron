(function () {
	
	var ipc	= require('electron').ipcRenderer;
	var remote = require('electron').remote;
	var Menu = remote.require('menu');
	var dialog = require('electron').remote.dialog;
	var shell = require('electron').shell;
	

	function AboutController() {
		var vm = this;
		vm.externalLink = {
			title: 'Electron',
			link: 'http://electron.atom.io/'
		};
	}

	AboutController.prototype.externalLinkGo = function (externalLink) {
		var vm = this;
		shell.openExternal(externalLink);
    };


	AboutController.$inject = [];

	angular.module('aboutController', []).controller('AboutController', AboutController);

}());