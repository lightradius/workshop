'use strict';

//Discussions service used to communicate Discussions REST endpoints
angular.module('discussions').factory('Discussions', ['$resource',
	function($resource) {
		return $resource('discussions/:discussionId', { discussionId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);