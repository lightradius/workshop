'use strict';

(function() {
	// Wikis Controller Spec
	describe('Wikis Controller Tests', function() {
		// Initialize global variables
		var WikisController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Wikis controller.
			WikisController = $controller('WikisController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Wiki object fetched from XHR', inject(function(Wikis) {
			// Create sample Wiki using the Wikis service
			var sampleWiki = new Wikis({
				name: 'New Wiki'
			});

			// Create a sample Wikis array that includes the new Wiki
			var sampleWikis = [sampleWiki];

			// Set GET response
			$httpBackend.expectGET('wikis').respond(sampleWikis);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.wikis).toEqualData(sampleWikis);
		}));

		it('$scope.findOne() should create an array with one Wiki object fetched from XHR using a wikiId URL parameter', inject(function(Wikis) {
			// Define a sample Wiki object
			var sampleWiki = new Wikis({
				name: 'New Wiki'
			});

			// Set the URL parameter
			$stateParams.wikiId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/wikis\/([0-9a-fA-F]{24})$/).respond(sampleWiki);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.wiki).toEqualData(sampleWiki);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Wikis) {
			// Create a sample Wiki object
			var sampleWikiPostData = new Wikis({
				name: 'New Wiki'
			});

			// Create a sample Wiki response
			var sampleWikiResponse = new Wikis({
				_id: '525cf20451979dea2c000001',
				name: 'New Wiki'
			});

			// Fixture mock form input values
			scope.name = 'New Wiki';

			// Set POST response
			$httpBackend.expectPOST('wikis', sampleWikiPostData).respond(sampleWikiResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Wiki was created
			expect($location.path()).toBe('/wikis/' + sampleWikiResponse._id);
		}));

		it('$scope.update() should update a valid Wiki', inject(function(Wikis) {
			// Define a sample Wiki put data
			var sampleWikiPutData = new Wikis({
				_id: '525cf20451979dea2c000001',
				name: 'New Wiki'
			});

			// Mock Wiki in scope
			scope.wiki = sampleWikiPutData;

			// Set PUT response
			$httpBackend.expectPUT(/wikis\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/wikis/' + sampleWikiPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid wikiId and remove the Wiki from the scope', inject(function(Wikis) {
			// Create new Wiki object
			var sampleWiki = new Wikis({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Wikis array and include the Wiki
			scope.wikis = [sampleWiki];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/wikis\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleWiki);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.wikis.length).toBe(0);
		}));
	});
}());