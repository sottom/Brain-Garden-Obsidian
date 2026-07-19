What needs done next week, by when?

# TODOs
## All
- Update to new naming (Diamond) in library
- Get accounting requirements into library - https://flooranddecor.atlassian.net/browse/CENT-867
## CRS
- Payments apis analysis - https://flooranddecor.atlassian.net/browse/CENT-972
	- how will someone get enrolled?
- Resolve by Membership ID - https://flooranddecor.atlassian.net/browse/CENT-942
- Under preference object - https://flooranddecor.atlassian.net/browse/CENT-937?focusedCommentId=341089
	- marketingSmsOptIn
	- loyaltyPushNotificationOptIn

## Membership
- Users for QA in databases to validate their data needs - https://flooranddecor.atlassian.net/browse/CENT-939

## Team Conversations
Monday - 7
- 2 - Handling Receipts
- 2 - Accounting Requirements
- 6 - Order History design - [[Excalidraw/F&D Loyalty ECOMM Mockups & Checkout Flows Loyalty.md#^R3Atgq5u|Order HIstory Accrual Picture]]
- Hold Endpoints
- **loyalty simulation endpoint** - returns Pro Bucks earned? Resulting tier from spend? Or accrual only?

Tuesday
# Meetings
## Payments
- During normal enrollment for full rollout and also seating for beta, how do we want to create membership representations in the payments system, when a new person is seated or enrolled. Let's talk through that flow.
- (Shane owns) Meeting with Karl about sales feed (Shane - Monday) and payments api.
## Everyone
- How will beta enrollment go from start to finish? Who owns driving this? Sterba?






Who do we need to bring in? What levels?
Determine what type of resources are needed for project to succeed. (not just how many)




Membership - make stories, get maria a buddy (jacob out next week), make mock data








ECOMM APIs - review 
- Get the **timeline for Order History design** delivery from the Loyalty team — pending vs. actual. _(Due Wed July 22)_
- Provide **timelines for holding benefits from web checkout against the Loyalty Engine** — when it enters dev, plus specs.
- Define the **loyalty simulation endpoint** (earnings based on current cart): endpoints + timelines for contract and dev deployment. Set up a meeting. Clarify what it returns — Pro Bucks earned? Resulting tier from spend? Or accrual only?
- Discuss with team and confirm with **Derek & Paul** that we can support the Order History Detail accrual box (pending vs. actual accrual saved on the order).
- Define what parameters **ECOMM needs to send the rules engine** to evaluate benefit-usage eligibility, and what the call returns (boolean? amount?). Determine whether the sales feed needs an identifier showing the benefit use was approved. _(Loyalty Engine to decide.)_
- **(ECOMM/Loyalty/CRM) Notification preferences** meeting — meeting needed on what's required from CRM and how to update it (beta vs. full launch). Notes: no notifications to the website; no SMS opt-in from the app for October. Mark Holland wants it for Beta (aware Sydney removed it from the app for Beta) — need to confirm CRM is committed for Beta, and whether it routes through CRS.
- Hold endpoint timeline

Determine who else is depending on us that may have needs.

Questions about Payments APIs - tomorrow.

App needs from BFF/WIMS

Who will interpret rules at checkout on the Web and In-Store? (local interpretation vs. querying the Loyalty Rules Engine).

Lane/Omar - communication with Marketing (intro meeting for them to understand our designs)
Clarify marketing requirements and how to fulfill them



- Performance Testing discussion in hack the loyalty (429)
- Overview of QA processes on Friday

App notifications needed - (Lane) push notifications that we are planning on sending

|   |   |   |   |
|---|---|---|---|
|**First F&D Bucks Earned — How to Redeem**|On first $1K spend increment at Silver. Celebration tone. Explains how to redeem in-store & online.|Push|Silver tier members|
|**F&D Bucks Issued (each subsequent $1K increment)**|Per-issuance. Shows available value, running balance, and expiration date.|Push|Silver+ members|

Talk to Paul/Jarrod about TSR by Friday/Wednesday July 22

Timelines of:
==Order History Endpoint - timeline== - paul defining what is needed, but Loyalty needs to get them a contract as soon as we can.
Enrollment - elections timeline
Membership data

Need mocked data for members to be used for testing (QA does this)?

There are gaps between the app mockups and
what the loyalty library can do, Jarrod going to tell us after testing.

Is another transaction already applied
is it within 45 days
(approved or denied right away)
- if delivered, give actual, if not, give pending

Do storage buy receipts (two of them) have the same transaction/order id? we need to key off of them for receipt uploads.

Lori Murphy - has mockups for app.

Talk to Duy about the need for a new event (notifications for the app when something is picked up).

Need scripts for databases, 


Loyalty items without much knowledge -- Fraud, replay of events on outage.
Performance Benchmarks talk with Keerthi.

I'm approver for performance testing...ask if Evan cares who does this. I don't want to.
![[Pasted image 20260716143958.png]]

- Talk to Karl about api contracts 7/17, cars team starts testing those apis 7/17.
- Timelines for History 
- Send over data to Austin Knuckols about membership data. CC Karthik

Review requirements against planned functional designs (excel sheet)
Review Keerthi's document to see if we missed anything in our designs

Begin planning out Full Rollout


Make stories


Simulate API
Evaluate if rules can be used api
![[Pasted image 20260718150453.png]]

POS
![[Pasted image 20260718155838.png]]

![[Pasted image 20260718155954.png]]

SNOW ticket for admin account re-activation


Requirements captured???
- marketing - set up meeting
- analytics - get austin what he needs
- app
- ecomm
- myproject
- storagebuy
- register
- accounting

![[Pasted image 20260718165758.png]]
![[Pasted image 20260718172250.png]]

Discuss manual upload flow - [[Excalidraw/Multiple Receipts Loyalty F&D.md#^3VedIycz|Receipts Diagram]]

Add story for systems trust matrix for full rollout - System Trust Matix
authorization (grants for read / write) 


# Other
- Look at EF Expectations for teammates
