'use strict';

//Ideas service used to communicate Ideas REST endpoints
angular.module('ideas').factory('Ideas', ['$resource',
	function($resource) {
		return $resource('ideas/:ideaId', { ideaId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);