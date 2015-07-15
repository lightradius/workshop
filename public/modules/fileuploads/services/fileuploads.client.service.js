'use strict';

//Fileuploads service used to communicate Fileuploads REST endpoints
angular.module('fileuploads').factory('Fileuploads', ['$resource',
	function($resource) {
		return $resource('fileuploads/:fileuploadId', { fileuploadId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);