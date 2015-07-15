'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

// Setting HTML5 Location Mode
angular.module(ApplicationConfiguration.applicationModuleName).config(['$locationProvider', '$mdIconProvider', '$mdThemingProvider', '$sceDelegateProvider',
    function($locationProvider, $mdIconProvider, $mdThemingProvider, $sceDelegateProvider) {
        $locationProvider.hashPrefix('!');

        $mdThemingProvider.theme('alternate')
            .primaryPalette('teal')
            .accentPalette('blue-grey');

        $mdThemingProvider.definePalette('darkPalette', {
            'contrastDefaultColor': 'light',
            '900': 'FAFAFA',
            '800': 'F5F5F5',
            '700': 'EEEEEE',
            '600': 'E0E0E0',
            '500': 'BDBDBD',
            '400': '9E9E9E',
            '300': '757575',
            '200': '616161',
            '100': '424242',
            '50': '212121',
            'A100': '333333',
            'A200': 'ff5252',
            'A400': 'ff1744',
            'A700': 'd50000',
        });

        $mdThemingProvider.theme('dark').dark()
            .primaryPalette('teal')
            .accentPalette('blue-grey')
            .backgroundPalette('darkPalette');

        $mdThemingProvider.theme('default')
            .primaryPalette('teal')
            .accentPalette('blue-grey')

        $sceDelegateProvider.resourceUrlWhitelist([
            'https://www.youtube.com/**',
            'https://www.youtu.be/**'
        ]);
    }
]);

angular.module(ApplicationConfiguration.applicationModuleName).constant('moment', moment);

//Then define the init function for starting up the application
angular.element(document).ready(function() {
    //Fixing facebook bug with redirect
    if (window.location.hash === '#_=_') window.location.hash = '#!';

    //Then init the app
    angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);
});