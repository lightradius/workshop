'use strict';

angular.module('core').controller('HeaderController', ['$rootScope', '$scope', 'Authentication', '$mdSidenav', '$http', '$location', '$state', '$mdDialog', '$timeout',
    function($rootScope, $scope, Authentication, $mdSidenav, $http, $location, $state, $mdDialog, $timeout) {
        $scope.authentication = Authentication;
        $rootScope.search = {
            tags: {},
            hideTags: false,
            keyword: '',
            statuses: [{
                status: 'Released',
                contain: true
            }, {
                status: 'Alpha',
                contain: false
            }, {
                status: 'Beta',
                contain: false
            }, {
                status: 'Prototype',
                contain: false
            }],
            hideStatuses: true,
            sortOptions: [{
                name: 'Alphabetical',
                sort: 'alphabetical'
            }, {
                name: 'Most Recently Added',
                sort: 'mostRecent'
            }, {
                name: 'Most Likes',
                sort: 'mostLikes'
            }, {
                name: 'Highest Rating',
                sort: 'highestRating'
            }, {
                name: 'Most Views',
                sort: 'mostViews'
            }],
            maxDisplay: 21
        };

        if (!$rootScope.search.sortBy) {
            $rootScope.search.sortBy = $rootScope.search.sortOptions[0].sort;
        }



        $rootScope.$watch('search.sortBy', function() {
            if ($rootScope.games && $rootScope.games.length > 0) {
                $rootScope.sortGameList();
            }
        });

        $rootScope.displayMoreResults = function() {
            if ($rootScope.search.maxDisplay < $rootScope.gamesDisplayed.length) {
                $rootScope.search.maxDisplay += 15;
            }
        };

        $rootScope.sortGameList = function() {
            $rootScope.games = $rootScope.games.sort(function(a, b) {
                var ret;
                switch ($rootScope.search.sortBy) {
                    case 'mostRecent':
                        console.log(new Date(b.created) - new Date(a.created));
                        ret = new Date(b.created) - new Date(a.created);
                        break;
                    case 'mostLikes':
                        ret = b.liked - a.liked;
                        break;
                    case 'highestRating':
                        ret = b.rating - a.rating;
                        break;
                    case 'mostViews':
                        ret = b.viewed - a.viewed;
                        break;
                    case 'alphabetical':
                        ret = ((a.name == b.name) ? 0 : (a.name < b.name ? -1 : 1));
                        break;
                }
                return ret;
            });
        };

        $rootScope.applySearch = function() {
            //applies the search to the games list
            $rootScope.gamesDisplayed = [];
            var search = $rootScope.search;

            var selectedTags = [];
            var selectedStatus = [];
            var keyMatch;
            if (search.keyword.length > 2) {
                keyMatch = new RegExp(search.keyword.trim(), 'i');
            }

            angular.forEach($rootScope.search.statuses, function(status) {
                if (status.contain) {
                    selectedStatus.push(status);
                }
            })

            angular.forEach($rootScope.search.tags, function(group) {
                angular.forEach(group.tags, function(tag) {
                    if (tag.contain) {
                        selectedTags.push(tag);
                    }

                });


            });


            angular.forEach($rootScope.games, function(game) {
                var matchTag = true,
                    match;

                var totalString = game.name + game.descriptionHTML + game.link;
                if (keyMatch) {
                    match = totalString.match(keyMatch);
                }

                if ((keyMatch && match) || !keyMatch) {
                    //for each of the selected tags and the game's tags, see if any of them match
                    for (var j = 0; j < selectedTags.length; j++) {
                        var stag = selectedTags[j];
                        var matched = false;
                        for (var i = 0; i < game.tags.length; i++) {
                            var gtag = game.tags[i];
                            if (gtag === stag.tag) {
                                matched = true;
                                break;
                            }
                        }
                        if (!matched) {
                            matchTag = false;
                            break;
                        }
                    }

                    if (matchTag) {
                        var reviewCheck = true;
                        if (search.reviewed && search.notreviewed && $scope.authentication.user) {
                            //do nothing
                        } else {
                            if (search.reviewed && $scope.authentication.user) {
                                if ($scope.authentication.user.reviewed.indexOf(game._id) >= 0) {
                                    reviewCheck = true;
                                } else {
                                    reviewCheck = false;
                                }
                            }

                            if (search.notreviewed && $scope.authentication.user) {
                                if ($scope.authentication.user.reviewed.indexOf(game._id) < 0) {
                                    reviewCheck = true;
                                } else {
                                    reviewCheck = false;
                                }
                            }
                            if (reviewCheck) {
                                $rootScope.gamesDisplayed.push(game);
                            }
                        }

                    }
                }
            });
        };

        $rootScope.$watch('search', function() {
            if ($rootScope.games && $rootScope.games.length > 0) {
                $rootScope.applySearch();
            }
        }, true);

        var localPrefs = $rootScope.localPrefs = (window.localStorage.getItem('localPrefs') ? JSON.parse(window.localStorage.getItem('localPrefs')) : {});

        $http({
            url: 'games/',
            params: {
                featured: true
            },
            method: 'GET'
        }).success(function(data, status, headers, config) {
            $scope.featuredGames = data;
        }).error(function(data, status, headers, config) {
            console.log('Error', data, status, headers, config);
        });

        $scope.updateLocalPrefs = function() {
            window.localStorage.setItem('localPrefs', JSON.stringify($rootScope.localPrefs));
        };

        $scope.toggleSideNav = function() {
            $mdSidenav('left').toggle();
        };

        $scope.openDialog = function(scope, ev, templateURL, controller, onclose, oncancel) {
            $rootScope.mdDialogOpen = true;
            var preserveScope = false;

            if (!controller) {
                controller = function() {};
                preserveScope = true;
            }

            $mdDialog.show({
                scope: scope,
                preserveScope: preserveScope,
                targetEvent: ev,
                clickOutsideToClose: true,
                templateUrl: templateURL,
                controller: controller
            }).then(function() {
                $rootScope.mdDialogOpen = false;
            }, function() {
                $rootScope.mdDialogOpen = false;
            });
        };

        $scope.closeDialog = function() {
            $mdDialog.hide();
            $rootScope.mdDialogOpen = false;
        };

        $rootScope.mdDialogOpen = false;

        $rootScope.$on('$stateChangeStart', function(event) {
            if ($rootScope.mdDialogOpen) {
                event.preventDefault();
                $scope.closeDialog();
            }
        });

        $scope.goto = function(state, href) {
            if (href) {
                window.location = state;
            } else {
                $state.go(state);
            }
        };

        $rootScope.$on('$stateChangeSuccess', function(event) {
            $timeout(function() {
                //$scope.lastState = location.hash.substr(2);
                var lastState = location.hash.substr(2);
                if (lastState !== '/signup' && lastState !== '/signin' && lastState !== '/signout') {
                    $scope.lastState = lastState;
                } else {
                    $scope.lastState = '/';
                }
            }, 100);

        });

        $rootScope.whatsMyVote = function(id) {
            if ($scope.authentication.user) {
                if ($scope.authentication.user.liked.indexOf(id) >= 0) {
                    return 1;
                } else if ($scope.authentication.user.disliked.indexOf(id) >= 0) {
                    return -1;
                }
            }
            return 0;
        };

        $rootScope.scoreThoughts = [
            '',
            'Horrible',
            'Bleh',
            'Meh',
            'Good',
            'Epic'
        ];

        $scope.stopPropagation = function(ev) {
            ev.stopPropagation();
        };


        $scope.canCreateGame = $scope.authentication.user ? true : false;

        $(document).click(function(evt) {
            $rootScope.increment('clickCount');
        });

        $rootScope.increment = function(thing) {
            var clickStatStr = localStorage.getItem('clickStat');
            var clickStat
            if (!clickStatStr) {
                clickStat = {}
            } else {
                clickStat = JSON.parse(clickStatStr);
            }

            if (!clickStat[thing]) {
                clickStat[thing] = 1;
            } else {
                clickStat[thing]++;
            }
            localStorage.setItem('clickStat', JSON.stringify(clickStat));
        }
    }
]);