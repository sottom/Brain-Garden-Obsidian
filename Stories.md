Here is a streamlined version of the stories, framed within the bigger picture of the overall system architecture. 

### The Bigger Picture (Epic Context)
**Epic: Customer Loyalty Benefits Pipeline**
To award loyalty benefits, we need a reliable data pipeline. Sales events will enter via **ActiveMQ**, be ingested by our **Java Consumption Log**, saved to an **Append-Only Ledger**, and pushed to **Kafka**. From there, a **Rules Engine** will calculate rewards and update the **Benefits Projection** for downstream consumers. 

Because we don’t know the sales payload yet, and we don't know how to manage this specific ActiveMQ instance, we are starting with infrastructure discovery and raw data connectivity.

---

### 1. The Spike (Discovery)
**Title:** SPIKE: Determine process to provision non-managed ActiveMQ queues
**Timebox:** 2-3 Days

**The Big Picture:** 
ActiveMQ is the entry point for all sales data into the loyalty ecosystem. Because this instance is non-managed Azure infrastructure and the team lacks experience with it, we must figure out how to safely create queues before we can build the pipeline.

**Acceptance Criteria:**
*   [ ] Identify and document the steps to create a new queue and a Dead Letter Queue (DLQ) in our specific Azure ActiveMQ setup.
*   [ ] Document how to create and manage application connection credentials.
*   [ ] Create a temporary POC queue in the DEV environment to prove the process works.

---

### 2. Infrastructure Story
**Title:** Provision `sales-event-feed` Queue and DLQ in ActiveMQ

**The Big Picture:** 
With the ActiveMQ provisioning process discovered, we need to create the actual infrastructure. This queue acts as the front door for the entire loyalty rules engine, ensuring no sales events are dropped before our microservice can process them.

**Acceptance Criteria:**
*   [ ] The `sales-event-feed` queue is created in DEV and QA environments.
*   [ ] A `sales-event-feed-dlq` is created, and messages failing 3 retries are automatically routed here.
*   [ ] Read/Acknowledge credentials are created for the Java microservice and stored securely in our secrets manager (e.g., Azure Key Vault).

---

### 3. Application Integration Story
**Title:** Connect Consumption Log Microservice to read raw ActiveMQ sales events

**The Big Picture:** 
We need our Java microservice to connect to ActiveMQ and establish the flow of data. While we don't know the exact sales payload yet, proving we can consume raw messages sets the stage for the next steps: parsing the payload, writing to the ledger, and publishing to Kafka for the rules engine.

**Description:**
**As a** loyalty platform,
**I want** the Consumption Log microservice to connect to ActiveMQ and ingest raw messages,
**So that** we have a guaranteed connection to the sales feed pipeline while we await final payload schemas.

**Acceptance Criteria:**
*   [ ] The microservice successfully connects to ActiveMQ using securely injected credentials.
*   [ ] The microservice successfully reads messages from `sales-event-feed` as a raw string/byte array.
*   [ ] The microservice successfully ACKs (acknowledges) the message to remove it from the queue.
*   [ ] In the event of an unhandled application error, the message is NACKed so ActiveMQ can route it to the DLQ.
*   [ ] Connection and consumption logic is verified in the CI/CD pipeline using a local ActiveMQ test container.


