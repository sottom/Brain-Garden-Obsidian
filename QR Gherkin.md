Here is the definitive, final Gherkin feature file incorporating every business rule, edge case, and architectural decision we discussed. 

Below it is the **step-by-step master plan with exact prompts** to feed into Claude Code to build this application reliably using AI-Assisted TDD.

### Part 1: The Final Gherkin Feature File
Save this file as `tests/features/qr-lifecycle.feature` in your repository.

```gherkin
Feature: QR Code Lifecycle and Grants Management (AKS Spring Boot Service)
  As the QR Resolver Spring Boot Service running in AKS (routed via APIM),
  I want to manage 32-character unique QR lookup strings with a maximum limit of one active code per type per account,
  So that the system remains secure, performant, and highly available.

  Background:
    Given the Spring Boot application is running in AKS
    And the Redis cache instance is active
    And the relational database is active
    And the dynamic configuration settings are:
      | app.qr.owner-ttl-seconds          | 30 |
      | app.qr.crew-ttl-days              | 90 |
      | app.qr.owner-rotation-grace-secs  | 5  |
    And a valid account "ACC-123" exists with Owner "C-1" and Crew "C-2"

  # ==========================================
  # AUTHENTICATION & SECURITY (BETA / HEADER-BASED)
  # ==========================================

  @security @edge-case
  Scenario: Spring Boot rejects request if required headers are missing
    Given a request originates without APIM validation
    When a POST request is made to "/v1/qr" missing the "X-Caller-Account-Id" header
    Then the response status is 400 Bad Request

  @generation @security @edge-case
  Scenario: Crew members are strictly forbidden from generating QR codes
    Given APIM forwards a request with headers:
      | X-Caller-Account-Id | ACC-123 |
      | X-Caller-Cust-Id    | C-2     |
      | X-Caller-Role       | CREW    | 
    When a POST request is made to "/v1/qr" with type "CREW"
    Then the response status is 403 Forbidden
    And the database does not create any new QR code record

  # ==========================================
  # STORY 02.1: GENERATE AND STORE A QR CODE
  # ==========================================

  @generation @standard
  Scenario: Owner requests a personal QR code for themselves
    Given APIM forwards an OWNER request for "ACC-123"
    When a POST request is made to "/v1/qr" with type "OWNER"
    Then the response status is 201 Created
    And the response body contains a "qrCode" lookup string that is exactly 32 characters and unique
    And the expiration "expiresAt" is set to exactly 30 seconds from now
    And the database record is saved with "scanCount" 0 and "deactivated" false
    And the Grants Service links the unique string to "spend_attribution" and "redemption" scopes

  @generation @standard
  Scenario: Owner requests a shared crew QR code for their staff
    Given APIM forwards an OWNER request for "ACC-123"
    When a POST request is made to "/v1/qr" with type "CREW"
    Then the response status is 201 Created
    And the expiration "expiresAt" is set to exactly 90 days from now
    And the response scopes contain ONLY "spend_attribution"

  @generation @business-rule
  Scenario: Generating a new QR automatically deactivates the previous QR of the same type
    Given an active "OWNER" QR code "OLD-OWNER-QR-32-CHARS-111111111" exists for "ACC-123"
    And "qr:OLD-OWNER-QR-32-CHARS-111111111" exists in the Redis cache
    When a POST request is made by "ACC-123" to generate a new "OWNER" QR code
    Then the response status is 201 Created
    And the old QR code "OLD-OWNER-QR-32-CHARS-111111111" is marked as "deactivated = true" in the DB
    And the old QR code cache key is evicted from Redis

  @generation @resilience @edge-case
  Scenario: System retries generation if a 32-character string collision occurs
    Given a generated 32-character string conflicts with an existing DB record
    When the database throws a Unique Constraint violation on save
    Then the Spring Boot service automatically generates a new string and retries the save
    And the final response returns a successful 201 Created

  # ==========================================
  # STORY 02.2: RESOLVE SCANNED QR (WITH CACHE)
  # ==========================================

  @resolution @cache @standard
  Scenario: POS resolves a QR code for the first time (Cache Miss)
    Given a valid, active QR lookup string "VALID-QR-STRING-32-CHARS-333333" exists in the DB for "ACC-123"
    When the POS scans the QR and GET "/v1/qr/resolve/VALID-QR-STRING-32-CHARS-333333" is called
    Then the response status is 200 OK
    And the payload is cached in Redis with a TTL of 5 minutes
    And the "scanCount" in the database is atomically incremented by 1

  @resolution @cache @standard
  Scenario: POS resolves a QR code rapidly (Cache Hit)
    Given the cached payload for "VALID-QR-STRING-32-CHARS-333333" exists in Redis
    When GET "/v1/qr/resolve/VALID-QR-STRING-32-CHARS-333333" is called again
    Then the response status is 200 OK
    And the DB lookup is bypassed
    But the "scanCount" for "VALID-QR-STRING-32-CHARS-333333" in the database is still atomically incremented by 1

  @resolution @edge-case
  Scenario: Resolution is allowed for a recently expired Owner QR within the grace period
    Given an "OWNER" QR code expired exactly 3 seconds ago
    When GET "/v1/qr/resolve/{expiredCode}" is called
    Then the response status is 200 OK

  @resolution @resilience @edge-case
  Scenario: System resolves QR from Cache even if the database is offline
    Given a valid QR lookup string is cached in Redis
    But the SQL Database is offline or unreachable
    When GET "/v1/qr/resolve/{qrCode}" is called
    Then the response status is 200 OK
    And the scan count increment is queued or logged for async retry

  # ==========================================
  # STORY 02.3 & 02.4: TRACK AND DEACTIVATE
  # ==========================================

  @monitoring @standard
  Scenario: Owner views all generated QR lookup strings for their account
    Given APIM forwards an OWNER request for "ACC-123"
    When a GET request is made to "/v1/qr/ACC-123"
    Then the response lists each QR record with its unique string, scan count, type, and status

  @deactivation @cache @idempotency @edge-case
  Scenario: Owner deactivates a QR lookup string idempotently
    Given APIM forwards an OWNER request for "ACC-123"
    And the database record for "QR-STRING-TO-DEACTIVATE-32-CHARS" has "deactivated" set to true
    When a DELETE request is made to "/v1/qr/QR-STRING-TO-DEACTIVATE-32-CHARS"
    Then the response status is 204 No Content
    And the Redis key is evicted
```

---

### Part 2: The Claude Code Execution Plan (Prompt by Prompt)

To maintain absolute trust, do not ask Claude Code to "build the whole app." You will act as the orchestrator, guiding Claude through a strict TDD pipeline. 

Create a `RULES.md` in your project root that says:
> *1. Use Java Spring Boot 3.x, Spring Data JPA, and Redis.* 
> *2. Use Flyway (or Liquibase) for DB migrations.* 
> *3. Do NOT implement JWT authentication; rely exclusively on `X-Caller-*` headers.* 
> *4. Tests must use Testcontainers for DB and Redis.*

Run `claude` in your terminal, and execute these prompts one by one, waiting for Claude to finish each step.

#### Prompt 1: The Test Infrastructure Setup
> "Review `RULES.md` and `tests/features/qr-lifecycle.feature`. Set up our project's Cucumber and Testcontainers infrastructure. 
> 1. Add required dependencies to `pom.xml`/`build.gradle`.
> 2. Create the Cucumber Spring configuration class.
> 3. Create a `Hooks.java` class with a `@Before` method that injects `StringRedisTemplate` and `JdbcTemplate` to completely flush the Redis cache and delete all rows from the `qr_codes` and `grants` tables before every scenario. Ensure this is fully working before moving on."

#### Prompt 2: The Step Definitions (Making the tests Red)
> "Now, generate the Cucumber Step Definitions (`QrStepDefinitions.java`) for the scenarios in `qr-lifecycle.feature`. 
> 1. Use `MockMvc` to execute the HTTP requests. 
> 2. Use `JdbcTemplate` to arrange DB state and assert DB outcomes.
> 3. Use `StringRedisTemplate` to arrange and assert Redis state.
> 4. Do not write the Spring Boot implementation code yet. Run the tests to prove they fail (Red phase)."

#### Prompt 3: Database & Redis Configuration
> "The tests are failing as expected. Now, build the data layer. 
> 1. Create the Flyway/Liquibase migration for the `qr_codes` and `grants` tables. The `qr_codes` table must have a unique constraint on the 32-character string.
> 2. Create the JPA Entities (`QrCode`, `Grant`) and Spring Data Repositories.
> 3. Create the Redis Cache configuration.
> 4. Create the `@ConfigurationProperties` class for the TTLs and Grace Period defined in the Gherkin."

#### Prompt 4: The Service Layer (Business Logic)
> "Implement the `QrResolverService.java` to fulfill the business logic. 
> Pay special attention to:
> 1. Generating exactly 32-character secure random strings.
> 2. The retry logic for unique constraint violations (use Spring `@Retryable`).
> 3. The Multiplicity constraint (deactivating the old QR code of the same type in a single transaction).
> 4. Atomic scanCount increment (use a custom `@Query` with `UPDATE qr_codes SET scan_count = scan_count + 1 WHERE...` rather than fetch-modify-save).
> Do not write the controllers yet."

#### Prompt 5: The Controller Layer (Making tests Green)
> "Create the `QrController.java`. 
> 1. Expose the POST, GET, and DELETE endpoints.
> 2. Extract the `X-Caller-Account-Id`, `X-Caller-Cust-Id`, and `X-Caller-Role` using `@RequestHeader(required = true)`.
> 3. Reject `CREW` users attempting to POST to the generation endpoint.
> Run the Cucumber test suite. If any tests fail, fix your implementation code until all tests pass."

#### Prompt 6: APIM Terraform & Security Hardening
*(Note: Run this prompt after the tests are green)*
> "The application is working. Now, act as a Cloud Architect. 
> 1. Write the `azurerm_api_management_api_operation` and `azurerm_api_management_api_policy` Terraform blocks for these endpoints. The policy must extract the JWT claims and inject them into the `X-Caller-*` headers. Save it to `infra/apim-qr.tf`.
> 2. Review all the Java code you just wrote for race conditions, IDOR vulnerabilities, or Redis connection leaks. If you find any, fix them and ensure the tests still pass."

By following this precise sequence, Claude Code is forced into a box. It cannot write rogue code because every line it writes must serve the Gherkin feature file. You get the extreme speed of AI generation, but with the architectural trust of a Senior Engineer.