'use strict';


angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$http',
    function($scope, Authentication, $http) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.getRecentActivity = function() {
            $http.get('/activity').success(function(data) {
                $scope.recentActivity = [];
                angular.forEach(data, function(activity, index) {
                    $scope.recentActivity = data;
                });
            }).error(function() {

            });
        };
    }
]);