'use strict';

//Setting up route
angular.module('wikis').config(['$stateProvider',
	function($stateProvider) {
		// Wikis state routing
		$stateProvider.
		state('listWikis', {
			url: '/wikis',
			templateUrl: 'modules/wikis/views/list-wikis.client.view.html'
		}).
		state('createWiki', {
			url: '/wikis/create',
			templateUrl: 'modules/wikis/views/create-wiki.client.view.html'
		}).
		state('viewWiki', {
			url: '/wikis/:wikiId',
			templateUrl: 'modules/wikis/views/view-wiki.client.view.html'
		}).
		state('editWiki', {
			url: '/wikis/:wikiId/edit',
			templateUrl: 'modules/wikis/views/edit-wiki.client.view.html'
		});
	}
]);