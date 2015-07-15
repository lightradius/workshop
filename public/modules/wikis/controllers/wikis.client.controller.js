'use strict';

// Wikis controller
angular.module('wikis').controller('WikisController', ['$scope', '$stateParams', '$location', 'Authentication', 'Wikis',
	function($scope, $stateParams, $location, Authentication, Wikis) {
		$scope.authentication = Authentication;

		// Create new Wiki
		$scope.create = function() {
			// Create new Wiki object
			var wiki = new Wikis ({
				name: this.name
			});

			// Redirect after save
			wiki.$save(function(response) {
				$location.path('wikis/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Wiki
		$scope.remove = function(wiki) {
			if ( wiki ) { 
				wiki.$remove();

				for (var i in $scope.wikis) {
					if ($scope.wikis [i] === wiki) {
						$scope.wikis.splice(i, 1);
					}
				}
			} else {
				$scope.wiki.$remove(function() {
					$location.path('wikis');
				});
			}
		};

		// Update existing Wiki
		$scope.update = function() {
			var wiki = $scope.wiki;

			wiki.$update(function() {
				$location.path('wikis/' + wiki._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Wikis
		$scope.find = function() {
			$scope.wikis = Wikis.query();
		};

		// Find existing Wiki
		$scope.findOne = function() {
			$scope.wiki = Wikis.get({ 
				wikiId: $stateParams.wikiId
			});
		};
	}
]);