'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$rootScope', '$scope', '$state', '$stateParams', '$http', '$timeout', '$mdDialog', '$location', 'Authentication', 'Games', 'Upload', 'Reviews', 'Discussions',

    function($rootScope, $scope, $state, $stateParams, $http, $timeout, $mdDialog, $location, Authentication, Games, Upload, Reviews, Discussions) {
        $scope.authentication = Authentication;

        $scope.availableTags = [];
        $scope.tags = [];

        $scope.maxfilesize = 500 * 1024;
        $scope.maxDiscussionsDisplayed = 5;
        $scope.maxReviewsDisplayed = 5;

        // Create new Game
        $scope.create = function() {
            // Create new Game object

            if ($scope.game.subreddit) {
                var r = $scope.game.subreddit.split('/');
                $scope.game.subreddit = r[r.length - 1];
            }

            var game = new Games({
                name: $scope.game.name,
                link: $scope.game.link,
                version: $scope.game.version,
                subreddit: $scope.game.subreddit,
                status: $scope.game.status,
                description: $scope.game.description
            });

            // Redirect after save
            game.$save(function(response) {
                $scope.closeDialog();
                $location.path('games/' + response._id);

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.confirmRemove = function(ev) {
            //$scope.openDialog($scope, ev, 'modules/games/views/remove-game.client.view.html');

            var confirm = $mdDialog.confirm()
                .parent(angular.element(document.body))
                .title('Are you sure you want to delete this game?')
                .ariaLabel('Confirm delete')
                .ok('Yes')
                .cancel('No')
                .targetEvent(ev);
            $mdDialog.show(confirm).then(function() {
                $scope.remove();
            }, function() {

            });

        };

        // Remove existing Game
        $scope.remove = function(game) {
            if (game) {
                game.$remove();
                var index;
                for (var i in $scope.games) {
                    if ($scope.games[i]._id === game._id) {
                        index = i;
                    }
                }
                $scope.games.splice(index, 1);
            } else {
                $scope.game.$remove(function() {
                    if ($scope.games) {
                        var index;
                        for (var i in $scope.games) {
                            if ($scope.games[i]._id === $scope.game._id) {
                                index = i;
                            }
                        }
                        $scope.games.splice(index, 1);
                    }
                    $location.path('games');
                });
            }
        };

        // Update existing Game
        $scope.update = function() {
            var game = $scope.game;

            if ($scope.game.subreddit) {
                var r = $scope.game.subreddit.split('/');
                $scope.game.subreddit = r[r.length - 1];
            }

            game.$update(function() {
                $scope.closeDialog();
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        $scope.getTags = function(success) {
            $http.get('/tags').success(function(data) {
                $scope.tags = data;
                $scope.availableTags = $.extend({}, data);

                angular.forEach(data, function(dgroup, cat) {
                    angular.forEach(dgroup, function(tag) {
                        var found = false;
                        var group = $rootScope.search.tags[cat];
                        if (!group) {
                            group = $rootScope.search.tags[cat] = {
                                tags: [],
                                hidden: true
                            };
                        }

                        for (var i = 0; i < group.tags.length; i++) {
                            if (group.tags[i].tag === tag) {
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            group.tags.push({
                                tag: tag,
                                contain: false
                            });
                        }
                    });
                });
                if (success) {
                    success();
                }
            });
        };

        $scope.getStatuses = function() {
            $http.get('/statuses').success(function(data) {
                $scope.statuses = data;

                angular.forEach(data, function(status) {
                    var found = false;
                    for (var i = 0; i < $rootScope.search.statuses.length; i++) {
                        if ($rootScope.search.statuses[i].status === status) {
                            found = true;
                            break;
                        }
                    }

                    if (!found) {
                        $rootScope.search.statuses.push({
                            status: status,
                            contain: true
                        });
                    }
                });
            });
        };

        $scope.getACL = function() {
            $http.get('/games/' + $scope.game._id + '/acl').success(function(data) {

                //various ACL stuff
                $scope.canEdit = data.canEdit;
                $scope.canChangeLogo = data.canChangeLogo;

                $scope.canAddScreenshots = data.canAddScreenshots;
                $scope.canDeleteScreenshots = data.canDeleteScreenshots;
                $scope.canRemoveTags = data.canRemoveTags;
                $scope.canAddTags = data.canAddTags;

                $scope.canReview = data.canReview;
                $scope.canDeleteGame = data.canDeleteGame;
            });
        };

        function checkCanAddReview() {
            $scope.canAddReview = true;
            if ($scope.authentication.user) {

                if ($scope.myReview) {
                    $scope.canAddReview = false;
                }
            } else {
                $scope.canAddReview = false;
            }
            $scope.selectedScore = 0;
        }

        $scope.listReviews = function() {
            var data = {};
            if ($scope.game && !$scope.reviews) {
                data = {
                    gameId: $scope.game._id
                };

                $scope.loadingReviews = true;
                $scope.reviews = Reviews.query(data, function() {
                    checkCanAddReview();
                    $scope.loadingReviews = false;
                }, function() {
                    $scope.loadingReviews = false;
                });

            }

        };

        $scope.listDiscussions = function() {
            var data = {};
            if ($scope.game && !$scope.discussions) {
                data = {
                    attached: $scope.game._id
                };

                $scope.loadingDiscussions = true;
                $scope.discussions = Discussions.query(data, function() {
                    $scope.loadingDiscussions = false;
                }, function() {
                    $scope.loadingDiscussions = false;
                });
            }

        };

        $scope.getFullDiscussion = function(id) {
            Discussions.get({
                discussionId: id
            }, function(response) {
                $scope.discussion = response;
                $scope.discussion.myVote = $scope.whatsMyVote(id);

                for (var i = 0; i < $scope.discussion.comments.length; i++) {
                    var comment = $scope.discussion.comments[i];
                    comment.myVote = $scope.whatsMyVote(comment._id);
                }

                $timeout(function() {
                    $('[data-class=discussion] pre code').each(function(i, block) {
                        hljs.highlightBlock(block);
                    });
                }, 400);
            });
        };


        $scope.editMyReview = function(ev, review) {
            if ($scope.game && $scope.authentication.user) {
                /*
                angular.forEach($scope.reviews, function(review) {
                    if (review.user._id === $scope.authentication.user._id) {
                        $scope.openReviewEditor(ev, review);
                    }
                });*/
                $scope.openReviewEditor(ev, review);
            }
        };

        // Find a list of Games
        $scope.find = function() {
            if (!$scope.tags.length) {
                $scope.getTags();
            }
            if (!$scope.statuses) {
                $scope.getStatuses();
            }

            var now = new Date();
            var diff;
            if ($rootScope.lastGameListLoad) {
                diff = now - $scope.lastGameListLoad;
            } else {
                diff = Infinity;
            }

            if (diff > 1000 * 60 * 3) {
                $scope.loadingGames = true;
                $scope.games = $rootScope.games = Games.query({}, function() {

                    console.log('Finding list of all games');
                    $scope.loadingGames = false;
                    $rootScope.lastGameListLoad = new Date();
                    console.log($rootScope.lastGameListLoad);

                    console.log('search: ', $rootScope.search);

                    $rootScope.sortGameList();

                    $rootScope.applySearch();
                }, function() {
                    $scope.loadingGames = false;
                });
            }

        };

        // Find existing Game
        $scope.findOne = function() {
            $scope.game = Games.get({
                gameId: $stateParams.gameId
            }, function() {
                if ($scope.authentication.user) {
                    if (!$scope.authentication.user.gamesLiked) {
                        $scope.authentication.user.gamesLiked = [];
                    }

                    $scope.likesThis = ($scope.authentication.user.gamesLiked.indexOf($scope.game._id) >= 0) ? true : false;

                    //tagging
                    $scope.showTagPane = false;
                    $scope.getTags(function() {
                        angular.forEach($scope.game.tags, function(tag) {
                            for (var i = 0; i < $scope.availableTags.length; i++) {
                                var group = $scope.availableTags[i];
                                group.splice(group.indexOf(tag), 1);
                            }
                        });
                    });

                    $scope.getACL();
                    $scope.getStatuses();


                    $scope.getMyReview();
                }

                $scope.maxScreenshots = 15;

                $scope.maxDiscussionsDisplayed = 5;

                $scope.maxReviewsDisplayed = 5;

                $scope.canShowMoreScreenshots = ($scope.game.screenshots.length > $scope.maxScreenshots);
                $scope.editAlbum = false;

                $scope.listReviews();

                $scope.listDiscussions();

                //go through the featured list, update with information
                angular.forEach($scope.featuredGames, function(game, index) {
                    if (game._id === $scope.game._id) {
                        $scope.featuredGames[index] = $scope.game;
                    }
                });

                if ($scope.game.rating) {
                    $scope.game.scoreStr = $rootScope.scoreThoughts[Math.round($scope.game.rating)];
                }


            });

        };

        $scope.getMyReview = function() {
            $http.get('/reviews/mine', {
                params: {
                    gameId: $scope.game._id
                }
            }).success(function(data) {
                if (data.length > 0) {
                    $scope.myReview = new Reviews(data[0]);
                    $scope.myReview.user = $scope.authentication.user;
                } else {
                    $scope.selectedScore = 0;
                }


                checkCanAddReview();
            }).error(function(data) {

            });
        };

        $scope.setSelectedScore = function(n) {
            $scope.selectedScore = n;
        };

        $scope.$watch('files', function() {
            $scope.upload($scope.files);
        });

        $scope.showMoreScreenshots = function() {
            if ($scope.canShowMoreScreenshots) {
                $scope.maxScreenshots += 15;
                $scope.canShowMoreScreenshots = ($scope.game.screenshots.length > $scope.maxScreenshots);
            }
        };

        function uploadprogress(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }

        function uploadsuccess(data, status, headers, config) {
            console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
            $scope.game.screenshots.unshift(data);
        }

        function upfile(files, index) {
            if (files.length > index) {
                var file = files[index];
                Upload.upload({
                    url: '/games/' + $scope.game._id + '/up',
                    fields: {},
                    file: file
                }).progress(uploadprogress).success(function(data, status, headers, config) {
                    uploadsuccess(data, status, headers, config);
                    upfile(files, index + 1);
                });
            }

        }

        $scope.upload = function(files) {
            if (files && files.length) {
                upfile(files, 0);
            }
        };


        $scope.deleteImage = function(img) {
            console.log(img);
            if ($scope.game.screenshots.indexOf(img) >= 0) {
                $http.delete('/games/' + $scope.game._id + '/' + img._id).success(function(data) {
                    console.log($scope.game.screenshots);
                    $scope.game.screenshots.splice($scope.game.screenshots.indexOf(img), 1);
                });
            }
            return false;
        };

        $scope.curUploads = [];

        $scope.$watch('logo', function() {
            if ($scope.logo) {
                $scope.changeLogo($scope.logo);
            }
        });

        $scope.changeLogo = function(file) {
            Upload.upload({
                url: '/games/' + $scope.game._id + '/logo',
                fields: {},
                file: file
            }).progress(function(evt) {
                /*$scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);*/
            }).success(function(data, status, headers, config) {
                console.log('file ' + config.file.name + 'uploaded. Response: ' + data);
                $scope.game.logo = data.filename;
            });
        };

        $scope.like = function() {
            //like this game.
            if ($scope.authentication.user && !$scope.likesThis) {
                $http.put('/games/' + $scope.game._id + '/like').success(function(data) {
                    $scope.authentication.user.gamesLiked.push($scope.game._id);
                    $scope.game.liked++;
                    $scope.likesThis = true;
                });
            }
        };

        $scope.unlike = function() {
            //unlike this game.
            if ($scope.authentication.user && $scope.likesThis) {
                $http.delete('/games/' + $scope.game._id + '/like').success(function(data) {
                    $scope.authentication.user.gamesLiked.splice($scope.authentication.user.gamesLiked.indexOf($scope.game._id), 1);
                    $scope.game.liked--;
                    $scope.likesThis = false;
                });
            }
        };


        $scope.$watch('newTag', function() {
            if ($scope.newTag) {
                $scope.addTag($scope.newTag);
            }
        });

        $scope.addTag = function(tag) {
            //add a tag
            if ($scope.game.tags.indexOf(tag) < 0) {
                $http.put('/tags/' + $scope.game._id + '/' + tag).success(function(data) {
                    $scope.game.tags.push(tag);
                    $scope.newTag = '';
                });
            }
        };

        $scope.removeTag = function(tag) {
            //remove a tag
            if ($scope.game.tags.indexOf(tag) >= 0) {
                $http.delete('/tags/' + $scope.game._id + '/' + tag).success(function(data) {
                    $scope.game.tags.splice($scope.game.tags.indexOf(tag), 1);
                });
            }
        };

        //editing
        $scope.editGame = function(ev) {
            $scope.error = null;
            if ($scope.canEdit) {
                $scope.openDialog($scope, ev, '/modules/games/views/edit-game.client.view.html');
            }
        };

        //creating
        $scope.openCreator = function(ev) {
            $scope.error = null;
            if ($scope.canCreateGame) {
                $scope.openDialog($scope, ev, '/modules/games/views/create-game.client.view.html');
            }
        };

        $scope.openImage = function(ev, index) {
            if (!$scope.editAlbum) {
                $scope.imgIndex = index;
                $scope.openDialog($scope, ev, '/modules/games/views/view-screenshot.client.view.html');
                /*var imgObj = new Image();
                imgObj.src = '/uploads/' + img;

                imgObj.onload = function() {
                    //dimensions of the image

                    var wi = imgObj.width,
                        hi = imgObj.height,
                        ww = $(window).width(),
                        hw = $(window).height() - 78,
                        h2, idealWidth;


                    h2 = hi * ww / wi;
                    if (h2 <= hw) {
                        $scope.idealWidth = ww * 0.8;
                    } else {
                        $scope.idealWidth = wi * hw / hi * 0.8;
                    }
                    $scope.openDialog($scope, ev, '/modules/games/views/view-screenshot.client.view.html');
                };*/
            }
        };

        //reviewing
        $scope.openReviewWriter = function(ev, score) {
            $scope.error = null;
            $scope.closeDialog();
            if ($scope.canReview) {
                $scope.review = {
                    score: score
                };
                $scope.openDialog($scope, ev, '/modules/reviews/views/create-review.client.view.html');
            }
        };

        $scope.openReviewEditor = function(ev, review) {
            $scope.review = new Reviews(review);
            $scope.error = null;
            $scope.openDialog($scope, ev, '/modules/reviews/views/edit-review.client.view.html');
        };

        $scope.openReviewDetails = function(ev, review) {
            $scope.review = review;
            $scope.error = null;
            $scope.openDialog($scope, ev, '/modules/reviews/views/view-review.client.view.html');
        };

        // Create new Review
        $scope.createReview = function() {
            // Create new Review object
            var review = new Reviews({
                name: $scope.review.name,
                gameId: $scope.game._id,
                content: $scope.review.content,
                score: $scope.review.score
            });

            if (!$scope.myReview) {
                // Redirect after save
                review.$save(function(response) {
                    response.user = $scope.authentication.user;
                    $scope.myReview = response;
                    $scope.reviews.unshift(response);
                    checkCanAddReview();
                    $scope.closeDialog();

                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            } else {
                $scope.error = 'You have already reviewed this game';
            }
        };

        // Remove existing Review
        $scope.removeReview = function(review) {
            if (review) {
                review.$remove(function() {
                    var index;
                    for (var i in $scope.reviews) {
                        if ($scope.reviews[i]._id === review._id) {
                            index = i;
                        }
                    }
                    $scope.reviews.splice(index, 1);

                    if ($scope.myReview && $scope.myReview._id === review._id) {
                        delete $scope.myReview;
                    }
                    $scope.closeDialog();
                    checkCanAddReview();
                });
            }
        };

        // Update existing Review
        $scope.updateReview = function(review) {
            review.$update(function(review) {
                $scope.myReview = review;
                console.log($scope.reviews);
                console.log(review);
                angular.forEach($scope.reviews, function(r, index) {
                    if (r._id == review._id) {
                        $scope.reviews[index] = review;
                    }
                });

                checkCanAddReview();
                $scope.closeDialog();
            }, function(errorResponse) {
                $scope.reviewEdit.error = errorResponse.data.message;
            });
        };



        //Discussion
        $scope.openDiscussionWriter = function(ev) {
            $scope.error = null;
            $scope.closeDialog();


            if ($scope.authentication.user) {
                $scope.discussion = {
                    content: ''
                };

                $scope.openDialog($scope, ev, '/modules/discussions/views/create-discussion.client.view.html');

            }
        };


        $scope.openDiscussionEditor = function(ev, discussion) {
            $scope.error = null;
            $scope.closeDialog();
            if ($scope.authentication.user._id === discussion.user._id || $scope.authentication.user.roles.indexOf('admin') >= 0) {
                $scope.discussion = discussion;
                $scope.openDialog($scope, ev, '/modules/discussions/views/edit-discussion.client.view.html');
            }
        };

        $scope.openDiscussionDetails = function(ev, discussion) {
            $scope.closeDialog();
            $scope.discussion = discussion;

            $scope.getFullDiscussion(discussion._id);

            $scope.comment = {

            };
            $scope.openDialog($scope, ev, '/modules/discussions/views/view-discussion.client.view.html');
        };

        $scope.createDiscussion = function() {

            if (!$scope.discussion.name || $scope.discussion.name.length === 0) {
                $scope.discussion.$error = 'name required';
            } else {
                // Create new Review object
                var discussion = new Discussions({
                    name: $scope.discussion.name,
                    attached: $scope.game._id,
                    attachType: 'games',
                    content: $scope.discussion.content,
                    link: $scope.discussion.link,
                    description: $scope.description
                });

                // Redirect after save
                discussion.$save(function(response) {
                    response.user = $scope.authentication.user;
                    $scope.discussions.unshift(response);
                    $scope.closeDialog();
                    //$scope.openDiscussionDetails(null, response);
                    $location.path('discussions/' + discussion._id);
                }, function(errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }


        };

        // Remove existing Review
        $scope.removeDiscussion = function(discussion) {
            if (discussion) {
                discussion.$remove(function(response) {
                    var index;
                    for (var i in $scope.discussions) {
                        if ($scope.discussions[i]._id === discussion._id) {
                            index = i;
                        }
                    }
                    if (!isNaN(index)) {
                        $scope.discussions.splice(index, 1);
                    }

                    discussion = null;
                    $scope.closeDialog();
                });

            }
        };

        // Update existing Discussion
        $scope.updateDiscussion = function() {
            $scope.discussion.$update(function() {
                $scope.edittingDiscussion = false;
            }, function(errorResponse) {
                $scope.discussionEdit.error = errorResponse.data.message;
            });
        };

        //vote on a discussion

        function updateVote(item, user, direction) {
            var id = item._id;
            var indLiked = user.liked.indexOf(id);
            var indDisliked = user.disliked.indexOf(id);

            if (direction === 1) {
                if (indLiked >= 0) {
                    //no change
                    item.myVote = 1;
                } else if (indDisliked >= 0) {
                    item.disliked--;
                    item.myVote = 0;
                    user.disliked.splice(indDisliked, 1);
                } else {
                    item.liked++;
                    item.myVote = 1;
                    user.liked.push(id);
                }
            } else if (direction === -1) {
                if (indLiked >= 0) {
                    item.liked--;
                    item.myVote = 0;
                    user.liked.splice(indLiked, 1);
                } else if (indDisliked >= 0) {
                    //no change
                    item.myVote = -1;
                } else {
                    item.disliked++;
                    item.myVote = -1;
                    user.disliked.push(id);
                }
            }
        }

        $scope.voteDiscussion = function(discussion, direction) {
            if ($scope.authentication.user) {
                $http.put('/discussions/' + discussion._id + '/vote', {
                    vote: direction
                }).success(function(response) {
                    updateVote(discussion, $scope.authentication.user, direction);
                });
            }
        };

        $scope.voteComment = function(comment, direction) {
            if ($scope.authentication.user) {
                $http.put('/comments/' + comment._id + '/vote', {
                    vote: direction
                }).success(function(response) {
                    updateVote(comment, $scope.authentication.user, direction);
                });
            }
        };

        //submit comment
        $scope.submitDiscussionComment = function() {
            if ($scope.discussion && $scope.comment && $scope.comment.content.trim().length > 0) {
                $http.put('/discussions/' + $scope.discussion._id + '/comment', $scope.comment).success(function(response) {
                    response.user = $scope.authentication.user;
                    $scope.discussion.comments.push(response);
                    $scope.comment = {};
                });
            }
        };

        $scope.reportDiscussion = function(discussion) {
            var reports = discussion.reports;
            if (discussion.reports.indexOf(discussion.report) < 0) {
                $http.post('/discussions/' + discussion._id + '/report', {
                    report: discussion.report
                });
            }

            discussion.reported = true;
            discussion.showReport = false;
        };

        $scope.reportComment = function(comment) {
            var reports = comment.reports;
            if (comment.reports.indexOf(comment.report) < 0) {
                $http.post('/comments/' + comment._id + '/report', {
                    report: comment.report
                });
            }

            comment.reported = true;
            comment.showReport = false;
        };

        $scope.increaseMaxDiscussions = function() {
            $scope.maxDiscussionsDisplayed += 5;
        };

        $scope.increaseMaxReviews = function() {
            $scope.maxReviewsDisplayed += 5;
        };

    }
]).filter('hasContent', function() {
    return function(items, search) {
        return items.filter(function(element, index, array) {
            return element.contentHTML.length === 0;
        });
    };
});