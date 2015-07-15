'use strict';

//Creators service used to communicate Creators REST endpoints
angular.module('creators').factory('Creators', ['$resource',
	function($resource) {
		return $resource('creators/:creatorId', { creatorId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);