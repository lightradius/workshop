'use strict';

//Wikis service used to communicate Wikis REST endpoints
angular.module('wikis').factory('Wikis', ['$resource',
	function($resource) {
		return $resource('wikis/:wikiId', { wikiId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);