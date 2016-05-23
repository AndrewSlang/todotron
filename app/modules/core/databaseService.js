(function () {

    var uuid = require('node-uuid');
    var path = require('path');
    var fs = require('fs');
    var remote = require('remote');
    var tasksCollection = remote.require('./main').DB;
    var dbPath = remote.require('./main').DBPath;

    function databaseService($q) {
        var vm = this;
        vm.$q = $q;
    }

    databaseService.prototype.newTask = function (data) {
        data._id = uuid();
        data.done = false;
        tasksCollection('tasks').push(data);
    };

    databaseService.prototype.getTasks = function () {
        var data = tasksCollection('tasks').cloneDeep();
        return data;
    };

    databaseService.prototype.getTask = function (id) {
        var data = tasksCollection('tasks').find({_id: id});
        return data;
    };

    databaseService.prototype.deleteTask = function (id) {
        tasksCollection('tasks').remove({_id: id});
    };

    databaseService.prototype.updateTask = function (data) {
        tasksCollection('tasks')
            .chain()
            .find({_id: data._id})
            .assign({name: data.name, description: data.description, done: data.done})
            .value();
    };

    databaseService.prototype.exportDB = function (filename) {
        var vm = this;
        return vm.$q(function(resolve, reject) {
            var rd = fs.createReadStream(dbPath);
            var wr = fs.createWriteStream(filename);
            resolve(rd.pipe(wr));
        });
    };

    databaseService.prototype.importDB = function (filename) {
        var vm = this;
        return vm.$q(function(resolve, reject) {
            var rd = fs.readFileSync(filename);
            resolve(fs.writeFileSync(dbPath, rd));
        })
        .then(ipc.send('reload-module-db'));
    };

    databaseService.$inject = ['$q'];

    angular.module('databaseService', []).service('databaseService', databaseService);
})();