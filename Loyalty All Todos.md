# Next Actions
- Schedule meetings for all Team Conversations
- Reply to ECOMM message with dates and times for getting answers.
- Talk to Evan about Pizza Party (schedule for next Tuesday???)


# To Confirm
- ==**(ECOMM/Loyalty/CRM) Notification preferences** meeting — meeting needed on what's required from CRM and how to update it (beta vs. full launch). Notes: no notifications to the website; no SMS opt-in from the app for October. Mark Holland wants it for Beta (aware Sydney removed it from the app for Beta) — need to confirm CRM is committed for Beta, and whether it routes through CRS.==





# TODO
## Mitchell
- Update to new naming (Diamond) in library
- Review new requirements with Liz and Evan - https://flooranddecor.atlassian.net/jira/dashboards/19407
- Get accounting requirements into library - https://flooranddecor.atlassian.net/browse/CENT-867
- (Tuesday) Membership - make stories, get maria a buddy (jacob out next week), make mock data
- Check with Jarrod 7/24 to see if there are any gaps between what app needs and what CRS is providing BFF.
- Get clear on correlation ids and why and how we should use them in our program.
- Ask team to review mockups for loyalty hub - https://flooranddecor.atlassian.net/browse/CENT-976
- Assign Performance testing sign-off to Shane? (tell Keerthi)
- Not until August? - Begin planning out Full Rollout
	- F&D Admin Controls
	- Add story for systems trust matrix for full rollout - System Trust Matix service
- SNOW ticket for admin account re-activation
- Set up fin triangles
## CRS
- Payments apis analysis - https://flooranddecor.atlassian.net/browse/CENT-972
	- how will someone get enrolled? 
	- Match data that they already have in Payments.
- Resolve by Membership ID - https://flooranddecor.atlassian.net/browse/CENT-942
- Under preference object - https://flooranddecor.atlassian.net/browse/CENT-937?focusedCommentId=341089
	- marketingSmsOptIn
	- loyaltyPushNotificationOptIn
## Comms Orchestrator (Marketing)
- Talk to Duy about the need for a new event (notifications for the app when something is picked up).
## BFF & WIMS
- TSR [Blanton, Jarrod, +2 | Group Chat | Microsoft Teams](https://teams.microsoft.com/l/chat/19:cb1eaf06f9644a3bb9a299e74d02b654@thread.v2/conversations?context=%7B%22contextType%22%3A%22chat%22%7D)
## Membership
- Users for (set of users) QA in databases to validate their data needs - https://flooranddecor.atlassian.net/browse/CENT-939



Beta Invite (how to get that information)




# Team Conversations
**Timelines for contracts and in-dev-by dates** July 24

- Integrating with new (correct) database, mock data (across BFF, CRS, membership & payments) - assign someone to drive this (Jacob McCarthy) - they need a login to the website - linking between all systems (good test data) - Jarrod/Paul, CRS, Membership, QA group to help with making data.
	- Payments apis analysis - https://flooranddecor.atlassian.net/browse/CENT-972
	- how will someone get enrolled? 
	- Match data that they already have in Payments.
- ~~Evaluate Benefits Usage endpoint (unique id for interaction) [[Pasted image 20260718172250.png]] - before Wednesday ideally (MVP)~~
- ~~**loyalty simulation endpoint** - returns Pro Bucks earned? Resulting tier from spend? Or accrual only?~~
- POS Sales Feed Gaps
- Handling Receipts endpoint [[Excalidraw/Multiple Receipts Loyalty F&D.md#^3VedIycz|Receipts Diagram]]
- (give these) Hold Endpoints (unique id for interaction) - see [[Pasted image 20260718150453.png]]
- Order History design - [[Excalidraw/F&D Loyalty ECOMM Mockups & Checkout Flows Loyalty.md#^R3Atgq5u|Order HIstory Accrual Picture]] (==loyalty history==)
- ==Salesforce needs (enrollment)==

- Review new requirements with Liz and Evan - https://flooranddecor.atlassian.net/jira/dashboards/19407
- - 2 - Accounting Requirements

- Security Decisions Meeting
- Fraud - receipt (3 tries per day)
- replay of events on outage
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