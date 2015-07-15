'use strict';

angular.module('games')
    .directive('markdownTextarea', ['$scope',
        function($scope) {
            return {
                templateUrl: 'modules/games/views/markdown-textarea.client.html',
                restrict: 'E',
                scope: {
                    content: '@'
                },
                link: function postLink(scope, element) {


                }
            }
        }
    ]);