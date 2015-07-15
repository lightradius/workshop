'use strict';

// Creators controller
angular.module('creators').controller('CreatorsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Creators',
	function($scope, $stateParams, $location, Authentication, Creators) {
		$scope.authentication = Authentication;

		// Create new Creator
		$scope.create = function() {
			// Create new Creator object
			var creator = new Creators ({
				name: this.name
			});

			// Redirect after save
			creator.$save(function(response) {
				$location.path('creators/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Creator
		$scope.remove = function(creator) {
			if ( creator ) { 
				creator.$remove();

				for (var i in $scope.creators) {
					if ($scope.creators [i] === creator) {
						$scope.creators.splice(i, 1);
					}
				}
			} else {
				$scope.creator.$remove(function() {
					$location.path('creators');
				});
			}
		};

		// Update existing Creator
		$scope.update = function() {
			var creator = $scope.creator;

			creator.$update(function() {
				$location.path('creators/' + creator._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Creators
		$scope.find = function() {
			$scope.creators = Creators.query();
		};

		// Find existing Creator
		$scope.findOne = function() {
			$scope.creator = Creators.get({ 
				creatorId: $stateParams.creatorId
			});
		};
	}
]);