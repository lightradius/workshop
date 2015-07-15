'use strict';

//Setting up route
angular.module('games').config(['$stateProvider',
    function($stateProvider) {
        // Games state routing
        $stateProvider.
        state('listGames', {
            url: '/games',
            templateUrl: 'modules/games/views/list-games.client.view.html'
        }).
        state('viewGame', {
            url: '/games/:gameId',
            templateUrl: 'modules/games/views/view-game.client.view.html'
        });
    }
]);