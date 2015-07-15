'use strict';

//Setting up route
angular.module('ideas').config(['$stateProvider',
	function($stateProvider) {
		// Ideas state routing
		$stateProvider.
		state('listIdeas', {
			url: '/ideas',
			templateUrl: 'modules/ideas/views/list-ideas.client.view.html'
		}).
		state('createIdea', {
			url: '/ideas/create',
			templateUrl: 'modules/ideas/views/create-idea.client.view.html'
		}).
		state('viewIdea', {
			url: '/ideas/:ideaId',
			templateUrl: 'modules/ideas/views/view-idea.client.view.html'
		}).
		state('editIdea', {
			url: '/ideas/:ideaId/edit',
			templateUrl: 'modules/ideas/views/edit-idea.client.view.html'
		});
	}
]);