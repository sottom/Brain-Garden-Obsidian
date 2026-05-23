## Must Have
### 1. Observability
- **Centralized logging location** SOLVED
    
    - **Why it matters:** In Kubernetes, containers (pods) are destroyed and recreated constantly. If a container crashes and restarts, its local logs are lost forever. Centralizing them ensures you don't lose the diagnostic history.
        
    - **Example:** A user reports an error that happened 10 minutes ago, but Kubernetes restarted the container 5 minutes ago. With centralized logs, you can still search and find the error.
        
    - **Can you do without it?** No. Troubleshooting production issues in Kubernetes without centralized logs is highly impractical.
	- SOLUTION

		Brendan Freeman  [3:08 PM]  
		
		Floor & Decor has one agent, so new microservices through their Kubernetes cluster automatically get integrated into Dynatrace. There are some tagging standards you can find here: [https://flooranddecor.atlassian.net/wiki/spaces/DEVOPS/pages/4394942477/Tagging+cheat+sheet](https://flooranddecor.atlassian.net/wiki/spaces/DEVOPS/pages/4394942477/Tagging+cheat+sheet). We are coming up with a specific Connected Customer cheat sheet I'll send you on Tuesday
- **Automated alerting on thresholds**
    
    - **Why it matters:** Engineers cannot watch dashboards 24/7. Alerts notify you immediately when something goes wrong.
        
    - **Example:** If your Spring Boot app's HTTP 500 error rate goes above 5% in a 1-minute window, the system automatically sends a notification to your Slack channel or paging tool.
        
    - **Can you do without it?** Only in pre-production. In production, skipping alerts means your users become your monitoring system.
### 2. Security
- **Encrypt data at rest**
    
    - **Why it matters:** If an attacker gets physical access to the cloud storage drives or steals a database backup file, they cannot read the sensitive data without the decryption keys.
        
    - **Example:** An automated database backup is accidentally exposed to the public internet, but because it is encrypted, the data remains unreadable.
        
    - **Can you do without it?** No. Most compliance frameworks (like GDPR or PCI-DSS) and cloud security best practices require this by default.   
- **Encrypt data in transit**
    
    - **Why it matters:** Prevents bad actors from intercepting network traffic between your users and your application, or between your internal microservices.
        
    - **Example:** When a user logs in, their password is encrypted via HTTPS before leaving their browser, preventing anyone on public Wi-Fi from reading it.
        
    - **Can you do without it?** No. Modern web browsers and APIs require HTTPS/TLS.
- **Secure secret management**
    
    - **Why it matters:** Storing passwords, API keys, or database credentials directly in your source code repository is a major security risk.
        
    - **Example:** Instead of hardcoding your Postgres password in application.properties, the application fetches it securely from Azure Key Vault at startup.
        
    - **Can you do without it?** No. Code repositories are frequently cloned, and accidental leaks to public repositories can happen easily.    
- **Identity and access management (IAM)**
    
    - **Why it matters:** The principle of least privilege ensures that applications and users only have access to the specific resources they need to do their job.
        
    - **Example:** Your Spring Boot microservice is granted permission to read from an Event Hub, but it is blocked from deleting or managing the Event Hub namespace.
        
    - **Can you do without it?** You can start with broad permissions early on, but hardening IAM is necessary to limit the blast radius of a potential breach.
### 3. Reliability / Resilience
- **Liveness and readiness probes**
    
    - **Why it matters:** Kubernetes needs to know if your application is fully started and healthy before sending traffic to it.
        
    - **Example:** If your Spring Boot app experiences an OutOfMemory error and stops responding, Kubernetes notices the liveness probe is failing and automatically restarts the container.
        
    - **Can you do without it?** No. These probes are fundamental to Kubernetes' self-healing capabilities.
### 4. Scalability & Performance
- **Auto-scaling based on load**
    
    - **Why it matters:** Traffic is rarely constant. Auto-scaling ensures you have enough resources during peak hours and saves money when traffic is low.
        
    - **Example:** During a marketing campaign, traffic spikes. AKS automatically scales your application from 2 pods to 10 pods, then scales back down to 2 pods at night.
        
    - **Can you do without it?** Yes, if your traffic is predictable and you are comfortable over-provisioning (and paying for) a fixed number of pods to handle peak load.
- **Caching frequently accessed data**
    
    - **Why it matters:** Database queries are relatively slow and expensive. Caching stores the results of common queries in memory for fast retrieval.
        
    - **Example:** Instead of querying Postgres every time a user loads your product catalog, you store the catalog in Redis, reducing load times from 200ms to 5ms.
        
    - **Can you do without it?** Yes, until your database becomes a bottleneck under high user traffic.
- **Database connection pooling**
    
    - **Why it matters:** Establishing a new database connection for every single query is slow and resource-intensive.
        
    - **Example:** Spring Boot uses HikariCP by default to keep a "pool" of 10 database connections open and ready to reuse, keeping database interactions fast.
        
    - **Can you do without it?** No. Disabling connection pooling will severely degrade database performance under concurrent load.
- **Asynchronous event processing**
    
    - **Why it matters:** If a task takes a long time, you shouldn't make the user wait for it to finish before sending a response.
        
    - **Example:** When a user registers, your app immediately responds with "Success" and publishes an event to Event Hubs. A background consumer reads the event and sends the welcome email later.
        
    - **Can you do without it?** Yes, but your API responses will be slower because users must wait for every background task to finish.
### 5. CI/CD & Deployment
- **Automated build pipelines**
    
    - **Why it matters:** Manual builds are prone to human error and differences in local developer setups.
        
    - **Example:** A developer pushes code to GitHub. An automated pipeline compiles the Java code, runs tests, builds a Docker image, and pushes it to Azure Container Registry.
        
    - **Can you do without it?** No. Manual builds waste time and introduce inconsistencies that make production debugging difficult.
- **Zero-downtime deployments**
    
    - **Why it matters:** You want to be able to release updates during business hours without interrupting your users.
        
    - **Example:** When deploying a new version in AKS, Kubernetes starts the new pods and waits for them to be ready before stopping the old ones.
        
    - **Can you do without it?** Yes, if you are comfortable scheduling maintenance windows and accepting brief downtime during deployments.
- **Automated infrastructure provisioning (IaC)**
    
    - **Why it matters:** Recreating infrastructure manually by clicking through the Azure Portal is slow, error-prone, and hard to track.
        
    - **Example:** You use Terraform scripts to spin up an identical staging environment that exactly matches your production environment in minutes.
        
    - **Can you do without it?** Yes, early on. However, manual setups make it difficult to maintain consistency between development, staging, and production environments.
- **Quick rollback strategies**
    
    - **Why it matters:** When a bad bug slips into production, you need a fast and reliable way to revert to the previous working version.
        
    - **Example:** You deploy an update that causes errors. Using ArgoCD, you click "Rollback" to instantly point AKS back to the previous stable Docker image.
        
    - **Can you do without it?** Yes, but fixing a bad release will take much longer and require more manual work under pressure.
### 6. Data Management
- **Database schema migrations**
    - **Why it matters:** Your database structure (schema) must evolve alongside your code changes in a safe, version-controlled manner.
        
    - **Example:** Your new code version requires a new phone_number column in the database. Flyway automatically runs the SQL script to add this column before the new code starts up.
        
    - **Can you do without it?** Yes, you can run SQL scripts manually, but this approach is highly prone to human error and out-of-sync environments.
- **Handling dead-letter queues (DLQs)**
    
    - **Why it matters:** When your application cannot process a message from Event Hubs (e.g., due to bad data), you don't want to lose the message or block the entire queue.
        
    - **Example:** A message with corrupt formatting arrives in Event Hubs. Your Spring Boot app catches the error, sends the message to a "dead-letter" topic for manual review, and moves on to the next message.
        
    - **Can you do without it?** Yes, but failing to handle bad messages can result in lost data or a stuck consumer group.
### 7. Configuration Management
- **Externalize app configuration**
    
    - **Why it matters:** You should compile your application code once and run it in any environment (Dev, QA, Prod) without changing the code itself.
        
    - **Example:** Your Spring Boot app looks for a ${DATABASE_URL} environment variable, which is set differently by AKS in Dev than in Prod.
        
    - **Can you do without it?** No. Hardcoding environment-specific configurations is a major anti-pattern.
- **Environment-specific variables**
    
    - **Why it matters:** Keeps your development environments isolated from production resources.
        
    - **Example:** A developer testing a new feature in the Dev environment should never accidentally write test data to the production PostgreSQL database.
        
    - **Can you do without it?** No. Separation of environments is a basic requirement for data safety.
### 8. Testing & Quality
- **High unit test coverage**
    
    - **Why it matters:** Unit tests verify that individual pieces of your business logic behave exactly as expected.
        
    - **Example:** A unit test verifies that your tax calculation method handles negative inputs, currency conversions, and rounding errors correctly.
        
    - **Can you do without it?** Yes, but without them, developers will be hesitant to make changes to the codebase for fear of breaking existing functionality.
- **Automated integration testing**
    
    - **Why it matters:** Unit tests verify code in isolation, but integration tests verify that your code works correctly with external systems like databases or message brokers.
        
    - **Example:** An integration test starts a temporary PostgreSQL database container, inserts a record using your Spring Boot repository, and verifies the data was saved correctly.
        
    - **Can you do without it?** Yes, but you risk encountering "works on my machine" issues where code passes local tests but fails when connected to real infrastructure.
- **Load and stress testing**
    
    - **Why it matters:** You need to know how your system behaves under heavy traffic before real users access it.
        
    - **Example:** A load test simulates 5,000 concurrent users checking out, helping you identify that your database connection pool size is too small before a major product launch.
        
    - **Can you do without it?** Yes, if you have low traffic or are comfortable letting your users organically test your system's performance limits.
- **Mocks**
### 9. Cost Management
- **Delete unused resources**
    
    - **Why it matters:** Unused resources in cloud environments continue to incur charges.
        
    - **Example:** A developer provisions a temporary Azure Postgres database for a spike, finishes their test, and deletes the instance so it stops billing the company.
        
    - **Can you do without it?** Only if you have an unlimited budget. Regular cleanup is necessary to control cloud spend.
### 10. Compliance & Governance
- **Track modifications with audit logs** (on DBs, code, etc.)
    
    - **Why it matters:** If a security breach or data corruption occurs, you need an unalterable history of who changed what and when.
        
    - **Example:** A user's profile is deleted. The audit log shows exactly which administrator performed the deletion and at what timestamp.
        
    - **Can you do without it?** Yes, for simple, low-risk applications. If you handle financial data or are subject to regulations like SOC2 or HIPAA, it is mandatory.    
### 11. Operations & Supportability
- **Track application versioning clearly**
    
    - **Why it matters:** You must always know exactly which version of the code is running in which environment to match bug reports to the correct code release.
        
    - **Example:** A bug report comes in for payment-service. Checking Kubernetes confirms the pod is running version v1.2.4, allowing you to inspect the exact code for that version.
        
    - **Can you do without it?** No. Deploying untagged or randomly versioned images makes troubleshooting nearly impossible.
### 12. API Design & Integration
- **Publish interactive API documentation**
    
    - **Why it matters:** It allows other teams and developers to understand and integrate with your microservices without needing to read your source code.
        
    - **Example:** A frontend developer uses an auto-generated Swagger UI web page to see what fields are required when sending a request to your API.
        
    - **Can you do without it?** Yes, but you will spend significant time manually explaining your endpoints and updating custom document files.
- **Enforce backward compatibility rules**
    
    - **Why it matters:** Upgrading one microservice should not break other services that depend on it.
        
    - **Example:** If you need to update an API, you add a new field to the JSON response instead of renaming an existing one, so older client versions do not crash.
        
    - **Can you do without it?** Only if you deploy your entire system as a single monolith. In a microservices architecture, breaking changes cause cascading failures.
- **Implement rate limiting for APIs**
    
    - **Why it matters:** It protects your application from being overwhelmed by too many requests, whether from a bug in a client application or a malicious attack.
        
    - **Example:** You limit clients to a maximum of 60 requests per minute on your search API to prevent them from crashing your Postgres database.
        
    - **Can you do without it?** Yes, for internal-only APIs. Public-facing APIs, however, require some form of rate limiting to ensure stability.
## Nice to Have

### 1. Observability
- **Metrics and usage dashboards**
    
    - **Why it matters:** Dashboards help you see trends over time rather than single points in time, making it easier to spot issues like memory leaks or slow performance trends.
        
    - **Example:** A dashboard shows your JVM memory usage steadily climbing over a 48-hour period, helping you catch a memory leak before the application crashes.
        
    - **Can you do without it?** Yes, temporarily. You can rely on basic log errors early on, though finding the root cause of performance degradation will be harder.
- **Distributed request tracing**
    
    - **Why it matters:** In a microservices architecture, a single user click might trigger a chain of calls across five different services. Tracing helps you follow the path of that single request.
        
    - **Example:** A user's page load takes 10 seconds. The trace shows Service A took 10ms, Service B took 20ms, but Service C spent 9.8 seconds waiting for a slow PostgreSQL query.
        
    - **Can you do without it?** Yes, if you only have 2 or 3 microservices. As your service graph grows, troubleshooting latency without tracing becomes very difficult.
### 2. Security
- **Vulnerability scanning for dependencies**
    
    - **Why it matters:** Modern apps use hundreds of open-source libraries. Scanners check if any of your libraries have known security flaws.
        
    - **Example:** A scanner flags that your version of Spring Framework has a critical security vulnerability and warns you to upgrade to a safer version.
        
    - **Can you do without it?** Yes, temporarily, but skipping it increases the risk of running code with known, easily exploitable bugs.
### 3. Reliability / Resilience

- **Graceful degradation and fallbacks**
    
    - **Why it matters:** If a non-essential feature fails, the rest of your application should continue working so the user experience doesn't completely break.
        
    - **Example:** If your personalized recommendation service goes down, your e-commerce app falls back to displaying a hardcoded list of popular items instead of showing an error page.
        
    - **Can you do without it?** Yes, but a failure in one minor service will cause a total outage for the end-user.  
- **Implement circuit breakers**
    
    - **Why it matters:** If a downstream dependency is slow or failing, a circuit breaker stops sending traffic to it, preventing your application from wasting resources waiting for requests that will likely fail anyway.
        
    - **Example:** Your payment gateway starts timing out. The circuit breaker trips and immediately returns a "Payment system busy" error to users, preventing your Spring Boot threads from backing up and crashing your app.
        
    - **Can you do without it?** Yes, for simple apps. It becomes important as traffic increases and downstream dependencies multiply.
- **Automated backups and restores**
    
    - **Why it matters:** Hardware fails, databases get corrupted, and human errors happen. You need a way to restore your data to a known good state.
        
    - **Example:** A bad database script accidentally deletes customer data. You use Azure's point-in-time restore to recover the database to its state 5 minutes before the incident.
        
    - **Can you do without it?** Only if your database contains data that is completely safe to lose.
- **Disaster recovery planning**
    
    - **Why it matters:** Entire cloud data centers can occasionally experience major power outages or network failures.
        
    - **Example:** Azure's East US region goes offline. Your disaster recovery plan allows you to quickly route traffic to your backup deployment in West US.
        
    - **Can you do without it?** Yes, depending on your business's tolerance for downtime. High-availability multi-region setups can be expensive and complex, so many early-stage applications accept the risk of single-region downtime.
### 4. Scalability & Performance
### 5. CI/CD & Deployment

### 6. Data Management
- **Data retention policies**
    
    - **Why it matters:** Databases grow over time, which increases storage costs and slows down query performance.
        
    - **Example:** You set up a scheduled task to archive or delete transaction logs that are more than two years old.
        
    - **Can you do without it?** Yes, for the first few months or years, until disk space costs or performance issues force you to address it.
### 7. Configuration Management
- **Dynamic config reloading**
    
    - **Why it matters:** Changing simple configuration settings shouldn't require rebuilding your code or restarting your application.
        
    - **Example:** You need to temporarily enable detailed debug logging to troubleshoot a live issue. You change the configuration in Azure, and Spring Boot updates its log level instantly without restarting.
        
    - **Can you do without it?** Yes. You can simply accept a brief application restart to apply new configuration changes.
### 8. Testing & Quality
### 9. Cost Management
- **Resource limits and quotas**
    
    - **Why it matters:** In Kubernetes, a single misconfigured application with a memory leak can consume all available resources on a node, causing other healthy applications to crash.
        
    - **Example:** You set a CPU limit of 500m and memory limit of 512Mi on your Spring Boot deployment, ensuring it cannot consume more than its fair share of the cluster.
        
    - **Can you do without it?** Yes, but running in Kubernetes without resource limits is highly risky, as one unstable pod can take down neighboring services.
- **Right-size database instances**
    
    - **Why it matters:** Cloud databases are often one of the most expensive components of a backend architecture.
        
    - **Example:** Your PostgreSQL metrics show that your CPU usage averages only 5%. You downsize the instance to a smaller tier, saving hundreds of dollars a month.
        
    - **Can you do without it?** Yes, you can over-provision resources early on for safety, but right-sizing is a key step in optimizing your infrastructure costs.

### 10. Compliance & Governance
- **Enforce cloud compliance policies automatically**
    
    - **Why it matters:** It prevents human error by stopping developers or administrators from accidentally creating insecure cloud resources.
        
    - **Example:** A policy automatically blocks anyone from creating a PostgreSQL database that allows public access from the internet.
        
    - **Can you do without it?** Yes, when you have a small team with tight controls. As the engineering organization grows, automated policies become necessary to prevent accidents.
- **Manage data privacy regulations strictly**
    
    - **Why it matters:** Governments enforce strict laws (like GDPR or CCPA) regarding how user data is stored, modified, and deleted. Non-compliance can lead to severe fines.
        
    - **Example:** When a user requests to delete their account, your system automatically and permanently deletes their personal data from your Postgres databases.
        
    - **Can you do without it?** Only if your application does not collect or store any personally identifiable information (PII).
#### 11. Operations & Supportability
- ==**Control feature releases using flags**==
    
    - **Why it matters:** It separates code deployment from feature release, allowing you to turn features on or off instantly without redeploying code.
        
    - **Example:** You deploy a new checkout page but keep it hidden. You turn it on for only 5% of users to test its stability in production before a full roll-out.
        
    - **Can you do without it?** Yes. You can release features to everyone at once, but it increases the risk of downtime if a bug is found in the new code.
- **Document common operational runbooks**
    
    - **Why it matters:** When an application fails at 3:00 AM, the on-call engineer needs immediate, step-by-step instructions on how to diagnose and fix the issue.
        
    - **Example:** A runbook titled "How to handle high consumer lag on Event Hubs" lists the exact commands to run to scale up the consumer pods.
        
    - **Can you do without it?** Yes, but outages will last longer because engineers will have to troubleshoot from scratch under pressure.
#### 12. API Design & Integration



# Questions to ask
What are failure points in this loyalty architecture?

What happens if POS retries events?

How should we prevent duplicate Bucks issuance?

What consistency model is acceptable here?

Should tier calculations be synchronous or eventual?
