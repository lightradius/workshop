'use strict';

(function() {
	// Creators Controller Spec
	describe('Creators Controller Tests', function() {
		// Initialize global variables
		var CreatorsController,
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

			// Initialize the Creators controller.
			CreatorsController = $controller('CreatorsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Creator object fetched from XHR', inject(function(Creators) {
			// Create sample Creator using the Creators service
			var sampleCreator = new Creators({
				name: 'New Creator'
			});

			// Create a sample Creators array that includes the new Creator
			var sampleCreators = [sampleCreator];

			// Set GET response
			$httpBackend.expectGET('creators').respond(sampleCreators);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.creators).toEqualData(sampleCreators);
		}));

		it('$scope.findOne() should create an array with one Creator object fetched from XHR using a creatorId URL parameter', inject(function(Creators) {
			// Define a sample Creator object
			var sampleCreator = new Creators({
				name: 'New Creator'
			});

			// Set the URL parameter
			$stateParams.creatorId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/creators\/([0-9a-fA-F]{24})$/).respond(sampleCreator);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.creator).toEqualData(sampleCreator);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Creators) {
			// Create a sample Creator object
			var sampleCreatorPostData = new Creators({
				name: 'New Creator'
			});

			// Create a sample Creator response
			var sampleCreatorResponse = new Creators({
				_id: '525cf20451979dea2c000001',
				name: 'New Creator'
			});

			// Fixture mock form input values
			scope.name = 'New Creator';

			// Set POST response
			$httpBackend.expectPOST('creators', sampleCreatorPostData).respond(sampleCreatorResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Creator was created
			expect($location.path()).toBe('/creators/' + sampleCreatorResponse._id);
		}));

		it('$scope.update() should update a valid Creator', inject(function(Creators) {
			// Define a sample Creator put data
			var sampleCreatorPutData = new Creators({
				_id: '525cf20451979dea2c000001',
				name: 'New Creator'
			});

			// Mock Creator in scope
			scope.creator = sampleCreatorPutData;

			// Set PUT response
			$httpBackend.expectPUT(/creators\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/creators/' + sampleCreatorPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid creatorId and remove the Creator from the scope', inject(function(Creators) {
			// Create new Creator object
			var sampleCreator = new Creators({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Creators array and include the Creator
			scope.creators = [sampleCreator];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/creators\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleCreator);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.creators.length).toBe(0);
		}));
	});
}());