# Next Actions
- Talk to Evan about Pizza Party (schedule for next Tuesday???)
- Sales from POS (how to connect to that - example)
	- Sales manually attached from Salesforce (how to connect to that - example)
	- Lookup of PPR members and if they are CAM or not (and active or not).
	- Customer number of sale is not changed in POS when it is deduped in Salesforce and all the data is moved to the clean rea
- - **Activate cascade** — does activateMembership alone trigger the CRM enrollment-date write (Q270) + tier lookback/seeding (WS-6 DEP-3) so the Hub is fully populated immediately after Join? (WS-6 treats a partial first Hub landing as a critical defect.)
    1. Currently, we don’t have a synchronous way to update the data when a membership is activated ([https://bitbucket.org/flooranddecor/loyalty-2.0-library/src/eee04b4da5d69befc91f0d326b1ae139b4c26401/domain-model/api-entities/openapi/loyalty-membership-service-api.openapi.yaml#lines-188:191](https://bitbucket.org/flooranddecor/loyalty-2.0-library/src/eee04b4da5d69befc91f0d326b1ae139b4c26401/domain-model/api-entities/openapi/loyalty-membership-service-api.openapi.yaml#lines-188:191)). I imagine you will need us to run/trigger necessary flows to update their YTD accrual at this point. If that is the case, we will need to update this endpoint (cc: @Hodgson, Evan, @Davenport, Shane, @Oconnor, Matthew, @Romero, Maria [CONTRACTOR]). We will need to make this update in our documentation.


# To Confirm
- ==**(ECOMM/Loyalty/CRM) Notification preferences** meeting — meeting needed on what's required from CRM and how to update it (beta vs. full launch). Notes: no notifications to the website; no SMS opt-in from the app for October. Mark Holland wants it for Beta (aware Sydney removed it from the app for Beta) — need to confirm CRM is committed for Beta, and whether it routes through CRS.==





# TODO
## Mitchell
- Get clear on correlation ids and why and how we should use them in our program.
- Ask team to review mockups for loyalty hub - https://flooranddecor.atlassian.net/browse/CENT-976
- Assign Performance testing sign-off to Shane? (tell Keerthi)
- Not until August? - Begin planning out Full Rollout
	- F&D Admin Controls
	- Add story for systems trust matrix for full rollout - System Trust Matix service
- Set up fin triangles
## CRS

## Comms Orchestrator (Marketing)

## BFF & WIMS

## Membership
- Users for (set of users) QA in databases to validate their data needs - https://flooranddecor.atlassian.net/browse/CENT-939



Beta Invite (how to get that information)




# Team Conversations
**Timelines for contracts and in-dev-by dates** July 24

- Integrating with new (correct) database, mock data (across BFF, CRS, membership & payments) - assign someone to drive this (Jacob McCarthy) - they need a login to the website - linking between all systems (good test data) - Jarrod/Paul, CRS, Membership, QA group to help with making data.
	- how will someone get enrolled? 
	- Match data that they already have in Payments.
	- ==Accounting==
	- ==Jacie SOX meeting==
	- ==SNOW ticket to databricks team for `sfcrm` connection to sql warehouse==
	- ==Mock data/users for app store apple to test with (sean coleman)==
- ==POS benefit check needing to pass in number of items they want to use - reconfirm this is what they need==
- ==Fraud== - https://flooranddecor.atlassian.net/browse/NOVA-459
- CRM
	- ==Salesforce needs (enrollment)==
- ==FRO - Get current rules for the program that people can query==
- ==Ability to query the number of a benefit that have been used across a date range==
- Ingestion
	- ==When manual assignment happens, create linking in the POS tables (during receipt upload)==
- Scheduling
	- ==Reconciliations epics/stories created==
- ==Charles Rogers - Hello Marty/Evan/Mitchell, In our on going efforts to address access to the new Jenkins Workspaces, Argo CD config, and Repositories, can you send me a list of the individuals for your teams.==
- ==In-auth security for holds== - https://flooranddecor.atlassian.net/browse/NOVA-682?focusedCommentId=345264
- ==SNOW ticket databricks - AKS service application to connect to Data SQL warehouse==
	- AKS - the service
	- The target - SQL Warehouse connection (not specific)
	- Purpose - read sfcrm data
	- Managed Identity that needs access
	    - ClientID
	    - ObjectID
	- Service Principal that needs access
	    - ClientID
	    - ObjectID
- ~~Benefit History ~~
	- ![[Pasted image 20260728120558.png]]


- Security Decisions Meeting
- ==Fraud - receipt (3 tries per day)== August 
- ==replay of events on outage==
- ==Seeding / Beta enrollment==
	- Talk to ECOMM and others about PPR shutoff Jan 31
- ==End of year batch scheduling==
- ==Membership activation need to run lookback for ytd spend==
- ==App testing by apple - need Mock users in Production, before September 14==
- ==Do we exclude skus?==
- ==Databricks integration==
	- Testing - need to add data to Databricks 
- Expiration
- "Suspended" language instead of DeActivated





# Meetings
## Payments
- During normal enrollment for full rollout and also seeding for beta, how do we want to create membership representations in the payments system, when a new person is seeded or enrolled. Let's talk through that flow.
- (Shane owns) Meeting with Karl about sales feed (Shane - Monday) and payments api.
## Marketing
Lane/Omar - communication with Marketing (intro meeting for them to understand our designs)
Clarify marketing requirements and how to fulfill them (asked - [Loyalty Comms Orchestrator Dev Team | Group Chat | Microsoft Teams](https://teams.microsoft.com/l/chat/19:75225caeb0b5439584c5e490ab9c47a1@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D)) - [PRO Loyalty Lifecycle Touchpoints_v4_10June2026_LIVE.xlsx](https://flooranddecor-my.sharepoint.com/:x:/p/as116009/IQB3Ppnper-IR5Sz2EfjHOryAbScl1e9gGqg6mVw_n2a6B8?e=2TxMeA)
- Set up placeholder emails for all of these journeys (TRG creating real ones, Mark's team could help us create fake ones for design/development purposes).
- Talk to Duy about the need for a new event (notifications for the app when something is picked up).
# QA
- Keerthi to set up Performance testing conversation
## Everyone
- How will beta **enrollment** go from start to finish? Who owns driving this? Sterba?




# Notes
- EComm figma - https://www.figma.com/design/YwPtXdDB6Zg3aTZHv51TPh/-UX--Experience-Map--Prototypes--Mockups---Floor-Decor?node-id=42283-172268&p=f




# Other
- Look at EF Expectations for teammates


**Bid Room Order Handling:** Evan clarified that for loyalty members with qualifying bid room orders over $10,000, free delivery will be handled manually via price overrides in the system, rather than being systemically enforced, to avoid complexity in flagging such transactions.
**Override Reason Codes:** Sydney and Evan discussed the use of different override reason codes for bid room orders, ensuring that free delivery for these orders does not decrement from the total free deliveries available to loyalty members.
**Technical Implementation:** Evan and Marty confirmed that the business rules engine will determine eligibility for free shipping, with the POS system passing the cart and receiving adjusted shipment amounts via API, and ==Karl noted the need for further design discussion.==



- Give receipt upload spec to Insha and Ramsey, do a review of endpoint.

# Cutover
- Feature Flags (FRO)
- Security (API keys?)
- Observability
- - ==For other systems too?== **Rollback plan** — since PPR runs in parallel, define how a beta market falls back to PPR-only cleanly. _(PM + this_library)_
- - A ==change freeze== across participating workstreams around the window, and a ==launch-day sequencing runbook== (order of operations, routing/APIM cutover, who does what when).
- ==War room== week of deployment.
- - support documentation for the stores