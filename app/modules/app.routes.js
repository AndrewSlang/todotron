(function () {
angular.module('app.routes', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/main');
	
	$stateProvider
		.state('main', {
			url: '/main',
			templateUrl : 'main/main.html'
		})
	    /*.state('task', {
	      	templateUrl: 'task/task.html',
	      	controller: 'TaskController',
	      	controllerAs: 'taskCtrl'
	    })*/
	});

	

}());