- Update prompt to put all architecture documentation outputs under a feature-named folder (like /qa/architecture-overview.md)
- work from a separate repo and just reference the base information (it builds in its own repo).


- Guardrails (standards that we follow) - each of these has its own markdown file
	- Adding terraform to APIM repo 
	- Adding k8s to k8s repo
	- Generating a new springboot project


Story - business requirements
- needs 30 second rotation
- qr code created
- other requiremetns


{basic requirements provided}

Based on the requirements above, please design what an ideal architecture would look like for this app given the following standards:
- springboot standards
- k8s repo deployment standards
- apim terraform standards
- database setup standards (single data in postgres with multiple schemas and the needed tables under those schemas)
- jenkinsfile standards

Creates Architecture markdown file.
Manually edit.

Generate the gherkin use-cases that satisfy the requirement previously given and create an excel sheet that has the requirement in the first column, and all of the gherkin use-cases that relate to that requirement in the next column.

Meet together, approve Gherkin.

(Devs) Based on the gherkin scenarios, please generate unit tests and add the gherkin story reference from the excel sheet as a comment (not the full gherkin story, just the reference)

Now that the tests are built, please create the code that satisfies the unit tests using the architecture document and requirements above.

Code is generated.

Unit tests are run and pass (no extra unit tests were created, or if they were, they were documented in the excel sheet with gherkin and we approve them as a team, all custom code (non-boilerplate) is covered).

Personal review of the code

(Developers) Please spin up all the local infrastructure needed for this functionality using docker containers so we can do integration tests against the code. Please provide a suite of integration tests that can be run against this local infrastructure to make sure everything is communicating correctly.

Review integrations tests.

Team reviews code, merge into dev branch.

Please create the k8s repo and any infrastructure needed (build and run the terraform), update the jenkinsfile to run unit and integration tests that will fail the pipeline if they don't pass (story is not handed to QA until deployment to Dev environment is complete).

QA Engineers run tests in Dev environment.

PO review, then ready for release.

Notes
- Our endpoints - Dev (mocks, breakable - QAs test here), QA (e2e), Prod
- QA can't run tests until they get contracts for APIs (will take them 1 day to integrate contracts into tests, then they can run the tests). They can create base tests in qtest though






- Create all the infrastructure needed for this application / feature description in local docker containers that can be spun up with one docker-compose up command.

Next

- Create the application 


spin up testing fixtures, 


req1 - usecase 1
req 1. usecase 2
req 2 usecase 1


(QAs) - please generate 

Use Current Dev as Sandbox.
blacklist a project


- Shane - figure out how to blacklist repos we don't want to use
- Jeff - database setup standards (single data in postgres with multiple schemas and the needed tables under those schemas)
- Jacob W - apim terraform standards
- J - k8s repo deployment standards 
- Maria - jenkinsfile standards
- Nur - how we want to generate gherkin stories (exact format, gotchas)
- Akanksha
- Mitchell - get requirements in place (solid ones for QR code)

confluence vs local
FitNess app for BDD in future





- Get all standards documents in loyalty-dev-base
- Run architecture prompt, review
- Gener

### Phase 1: Architecture & Design

- **Receive Basic Requirements:** Review the provided baseline requirements for the application.
    
- **Design the Architecture:** Draft an architecture plan that aligns with the following standards:
    
    - **Spring Boot Standards:** Framework-specific patterns and structuring.
        
    - **K8s Repo Deployment Standards:** Containerization and Kubernetes deployment configurations.
        
    - **APIM Terraform Standards:** API Management infrastructure defined as code.
        
    - **Database Setup Standards:** A single PostgreSQL instance configured with multiple schemas and corresponding tables.
        
    - **Jenkinsfile Standards:** CI/CD pipeline definitions.
        
- **Define API Contracts:** Establish the API specifications and contracts based on the architectural design and requirements (build a mock which IS the API spec (via swagger))
    
- **Document the Architecture:** Generate an initial architecture markdown file, including the API contract definitions.
    
- **Refine Documentation:** Manually edit and finalize the architecture markdown file.
    

### Phase 2: Specification & Test Definition

- **Generate Gherkin Use-Cases:** Translate the requirements into Gherkin-formatted scenarios in a new tab in excel sheet.
    
- **Create the Traceability Matrix:** Produce an Excel spreadsheet containing:
    
    - **Column 1:** The original requirement.
        
    - **Column 2:** The associated Gherkin use-case references.
        
- **Provide Contracts to QA:** Share the API contracts with the QA team.
    
    - Note: QA can begin writing base tests in qTest immediately, but they require 1 day to integrate these contracts into their automation suite before executing them.
        
- **Review and Align:** Hold a team meeting to review, refine, and approve the Gherkin scenarios.
    

### Phase 3: Development & Unit Testing

- **Write Unit Tests:** Developers draft unit tests based directly on the approved Gherkin scenarios.
    
    - **Reference Tracking:** Include the Gherkin story reference from the Excel sheet as a comment within the unit test code (reference identifier only, not the full text).
        
- **Implement Application Code:** Write the business logic and code required to satisfy the unit tests, following the approved architecture document and requirements.
    
- **Execute and Verify Unit Tests:** Run the unit tests to ensure they pass. (==chaos testing??? removing lines of code to see if tests fail (instead of pass)==)
    
    - Ensure all custom, non-boilerplate code is covered.
        
    - If any additional unit tests were added during development, document them in the Excel sheet with associated Gherkin scenarios and obtain team approval.
        
- **Conduct Self-Review:** Perform an initial personal review of the code.
    

### Phase 4: Local Integration Testing & Code Review

- **Set Up Local Infrastructure:** Developers spin up the required local infrastructure (such as databases or mock services) using Docker containers.
    
- **Develop Integration Tests:** Create a suite of integration tests to verify communication between the application and the local containerized infrastructure.
    
- **Verify Integration:** Run and review the local integration tests.
    
- **Conduct Team Review:** Perform a formal peer code review with the team.
    
- **Merge Code:** Once approved, merge the code into the dev branch.
    

### Phase 5: Infrastructure Setup & Deployment

- **Prepare K8s and Infrastructure:** Create the Kubernetes repository and define any required infrastructure components.
    
- **Deploy Infrastructure:** Build and apply the Terraform configurations (including APIM and database schemas).
    
- **Configure CI/CD Pipeline:** Update the Jenkinsfile to run both unit and integration tests. Configure the pipeline to fail and block deployment if any tests do not pass.
    
- **Deploy to Dev Environment:** Deploy the application to the Dev environment (which utilizes mock services and is designed for testing).
    
    - Note: The story should not be handed over to QA until this deployment is verified as complete.
        

### Phase 6: QA Validation & Release

- **Execute QA Testing:** QA Engineers run their test suites against the Dev environment endpoints.
    
- **Perform PO Review:** The Product Owner reviews the completed features.
    
- **Promote and Release:** Proceed to downstream environments (QA for end-to-end integration testing, followed by Production) for release preparation.






- Fleshing out requirements
- Fully Deploy QR service
- Prompt for deploying to k8s and jenkins
- get a sale through activeMQ to the benefits projection
- get laptops setup
	- spin up infrastructure for QR code repo locally (DBs)
- Fixtures / Testing (unit and integration)
	- docker
- Mocks (get them working for QR)
- Get a spring example repo we like





















