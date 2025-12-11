# Testing Infrastructure - Quick Reference

## Running Tests

### Run all tests
```bash
mvn clean test
```

### Run tests for specific service
```bash
cd services/hotel-service
mvn test
```

### Run with coverage report
```bash
mvn clean test jacoco:report
```

### View coverage report
Open: `target/site/jacoco/index.html`

## Test Structure

```
src/test/java/com/ticketkatum/
├── unit/                    # Unit tests (fast, isolated)
│   ├── service/            # Service layer tests
│   ├── controller/         # Controller tests
│   └── repository/         # Repository tests
├── integration/            # Integration tests (slower, real dependencies)
│   ├── api/               # API integration tests
│   └── database/          # Database integration tests
└── e2e/                   # End-to-end tests
    └── scenarios/         # User journey tests
```

## Test Examples Created

### 1. Unit Test
**File**: `HotelServiceTest.java`
- Tests business logic in isolation
- Uses Mockito for mocking dependencies
- Fast execution (milliseconds)

### 2. Integration Test
**File**: `HotelRepositoryIntegrationTest.java`
- Tests database operations with real PostgreSQL
- Uses Testcontainers for database
- Slower execution (seconds)

## Coverage Targets

- **Services**: 80% line coverage
- **BFF**: 70% line coverage
- **Overall**: 75% line coverage

## Best Practices

1. **Naming**: `shouldDoSomethingWhenCondition()`
2. **Structure**: Given-When-Then pattern
3. **Assertions**: Use AssertJ for fluent assertions
4. **Isolation**: Each test should be independent
5. **Speed**: Keep unit tests fast (<100ms)

## Next Steps

1. Create tests for remaining services
2. Add controller tests
3. Create E2E test scenarios
4. Set up CI/CD integration
