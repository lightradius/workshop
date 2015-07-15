'use strict';

//Setting up route
angular.module('creators').config(['$stateProvider',
	function($stateProvider) {
		// Creators state routing
		$stateProvider.
		state('listCreators', {
			url: '/creators',
			templateUrl: 'modules/creators/views/list-creators.client.view.html'
		}).
		state('createCreator', {
			url: '/creators/create',
			templateUrl: 'modules/creators/views/create-creator.client.view.html'
		}).
		state('viewCreator', {
			url: '/creators/:creatorId',
			templateUrl: 'modules/creators/views/view-creator.client.view.html'
		}).
		state('editCreator', {
			url: '/creators/:creatorId/edit',
			templateUrl: 'modules/creators/views/edit-creator.client.view.html'
		});
	}
]);