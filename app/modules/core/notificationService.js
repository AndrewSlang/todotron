(function () {

    function notificationService() {
        var vm = this;
    }

    notificationService.prototype.noteTask = function (titleTask) {
        var vm = this;
        return new Notification('TodoTron', {body: 'Task ' + titleTask + ' successfully delete', icon: '../assets/resources/icon.png'});
    };

    notificationService.prototype.noteNewTask = function () {
        return new Notification('TodoTron', {body: 'New task successfully created', icon: '../../assets/resources/icon.png'});
    };

    notificationService.prototype.noteEditTask = function (titleTask) {
        return new Notification('TodoTron', {body: 'Task ' + titleTask + ' successfully edit', icon: '../../assets/resources/icon.png'});
    };

    notificationService.prototype.noteExport = function () {
        return new Notification('TodoTron', {body: 'Task list successfully export', icon: '../assets/resources/icon.png'});
    };

    notificationService.prototype.noteImport = function () {
        return new Notification('TodoTron', {body: 'Task list successfully import', icon: '../assets/resources/icon.png'});
    };

    notificationService.prototype.notePrint = function () {
        return new Notification('TodoTron', {body: 'PDF file successfully saved', icon: '../../assets/resources/icon.png'});
    };

    notificationService.$inject = [];

    angular.module('notificationService', []).service('notificationService', notificationService);
})();