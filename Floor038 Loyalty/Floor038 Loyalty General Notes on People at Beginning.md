
- Can a membership with two pro accounts have two different owners?
- We can't accept concurrent calls for the same membership (or else we might double count crossing a threshhold).
- POS needs a queue if Loyalty system is down (daily reconciliation against the ledger vs what POS captured as well)
- How does this work? They need an endpoint for processing: ### Flow 9: Adjusting Bob's Points Manually (CS Agent)
- why does pos handle expiration? - **POS Platform balance services** (LOYAL-126/127) own the authoritative balance ledger, register-time redemption, expiration execution, and payment method collection — keeping payment rails and PCI scope aligned with the team that already operates gift card and store credit ledgers
- I thought it was 12 months rolling, not re-evaluated in january? - Annual re-qualification on **January 1** based on prior-year spend - - Downgrades occur at year boundary only; mid-year promotions are permanent for the year
- cash back rebate - Finalized after return window closes
- If you get to a tier in November, does it expire in january when re-evaluated?
- good - - Redeemable **in-store only** via barcode scan at POS (e-commerce redemption at Full Launch)
- if redeemed then returned, it's deducted from refund.
- once delivered, then reward is given.
- no expiration in beta
- no rebates disbursed during beta
- sample benefit not beta
- 


# Notes from Liz 5/4/26
11 years at f&d. In stores 7 years. SSC 4-5 years. Director of design services operations. Worked on teh business side. Then realized she wanted to be on the prodeuct side. 
Scheduling story mapping sessions to zero in on actual journey and make sure there are no gaps and get all business requirements. When loyalty launches, it will be in the new pro app. Customers selfmanager spend and rewards (no points!). managed all in pro app. Core loyalty engine. Build tiers, rules, etc. 
- Hardest part has been decision making. Long time to get business requirements. Custom build was finalized in April. The team keeps circling back and forth on what COULD be done/changed. 
- February 1, October Beta. Must be done.
- First time there is product funding instead of project funding (recurring budget year after year). Interesting to see how that plays out.
- Needs help with translating things correctly when writing stories.  It's been really hard (scraping the barrel trying to keep everyone engaged). 
	- Everyone is doing spikes based on assumptions.

# People
- Sydney - Pro App product owner
- Liz - Loyalty Engine product owner
# Links
- fake loyalty pro app - [https://pro-app-2.app-dev.floordecor.com/](https://pro-app-2.app-dev.floordecor.com/ "https://pro-app-2.app-dev.floordecor.com/") 
- fake admin page loyalty - [https://loyalty-admin.app-dev.floordecor.com/dashboard](https://loyalty-admin.app-dev.floordecor.com/dashboard "https://loyalty-admin.app-dev.floordecor.com/dashboard")
- Workstreams - https://flooranddecor.atlassian.net/wiki/spaces/CC/pages/5567217680/Technical+Workstreams+POD+Scope+Matrix
- OG Architecture Overview - https://flooranddecor.atlassian.net/wiki/spaces/CC/pages/5616992274/Architecture+Overview
- Loyalty Platform Notes - https://flooranddecor.atlassian.net/wiki/spaces/CC/pages/5506007042/Loyalty+Platform
- SOW - [F&D Pariveda Connected Customer Support 2026 Final](https://pariveda.sharepoint.com/:b:/t/FloorDecor/IQB0-v0_z8LDQa_vKuCirQScAVRR137PfaQiquDpjX4DQE0?e=KMWsj7)
- CO1 - [Connected Customer 2026 CO1_Loyalty SOW - Draft.docx](https://pariveda.sharepoint.com/:w:/t/FloorDecor/IQBqqi5DqkCpRpu1VgRocyikAQlk8Se9tQ_SpAMmn57ssoU?e=9O6PD2)
- Pariveda Loyalty Sharepoint - [Floor040 - Loyalty & Text Marketing](https://pariveda.sharepoint.com/:f:/t/FloorDecor/IgAXVPS2P730Q7y13sBTLgGnAcf4Z548OFvjlWPOioBwfeQ?e=Vm0V9U)
- Onboarding Checklist - [Fin Project Onboarding Guide - Copy.xlsx](https://pariveda.sharepoint.com/:x:/t/FloorDecor/IQCfBqOH210PQ63XNNfitTqxAT0ZIeKQPe3WVwTMlcdLeZA?e=Sjx173)
- Draft Vocab from OG - https://flooranddecor.atlassian.net/wiki/spaces/CC/pages/5630623747/Definitions+Loyalty+2.0+Shared+Vocabulary
	- ![[Pasted image 20260504150550.png]]

# TODO
- ==Overview== - [Liftoff](https://pariveda.sharepoint.com/:u:/r/teams/3DEngagement/SitePages/Liftoff.aspx?csf=1&web=1&e=Yh95Sa)
- Working agreements - [Complete Agreements Prep Work](https://pariveda.sharepoint.com/:u:/r/teams/3DEngagement/SitePages/Complete-Agreements-Prep-Work.aspx?csf=1&web=1&e=5Gw4Md)
- [Conduct Internal Project Kick-off](https://pariveda.sharepoint.com/:u:/r/teams/3DEngagement/SitePages/Conduct-Internal-Project-Kick-off.aspx?csf=1&web=1&e=t0ADAW)
- [Team Feedback Loops](https://pariveda.sharepoint.com/:u:/r/teams/3DEngagement/SitePages/Team-Feedback-Loops.aspx?csf=1&web=1&e=RohS18)
- WBS - scope out the work.
	- don't hardcode conditions (need a rules engine that can be changed).
	- Who is the product owner that decides what is ok vs not for tradeoffs. Sydney?
	- Ask Evan who is the Central Architect that makes decisions when we disagree across all systems?
	- How will we test this in different environments?

# client Artifacts
- miro board CRM transition to Account - [https://miro.com/app/board/uXjVGhDFdH4=/?share_link_id=271227319110](https://miro.com/app/board/uXjVGhDFdH4=/?share_link_id=271227319110 "https://miro.com/app/board/uxjvghdfdh4=/?share_link_id=271227319110")
- beta vs launch requirments (lane has most up-to-date version) - [FND PRO Loyalty_Beta requirements_01APRIL2026.xlsx](https://flooranddecor-my.sharepoint.com/:x:/r/personal/er35405_flooranddecor_com/_layouts/15/Doc.aspx?sourcedoc=%7B305B7F29-93CC-4238-B94E-F622CB725E78%7D&file=FND%20PRO%20Loyalty_Beta%20requirements_01APRIL2026.xlsx&action=default&mobileredirect=true&isSPOFile=1&xsdata=MDV8MDJ8fDBiOWQ0MzdhOTA1MDRlMDljMTBhMDhkZWE2Y2YwMmFlfDZlZDFjZmZiMGJmNzRiZGJhYTY3NmMzNGU3ZjMyYmIzfDB8MHw2MzkxMzE2MDUxNjY2MzczMjJ8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKRFFTSTZJbFJsWVcxelgwRlVVRk5sY25acFkyVmZVMUJQVEU5R0lpd2lWaUk2SWpBdU1DNHdNREF3SWl3aVVDSTZJbGRwYmpNeUlpd2lRVTRpT2lKUGRHaGxjaUlzSWxkVUlqb3hNWDA9fDF8TDJOb1lYUnpMekU1T20xbFpYUnBibWRmVDFkWk5WbFVhelZaTWxsMFQxUnJNazFETURCT1YwcHJURlJuZWxwVVFYUk9la0Y2V21wak5FMUVTVFJhUkVGM1FIUm9jbVZoWkM1Mk1pOXRaWE56WVdkbGN5OHhOemMzTlRZek56RTFNREV3fDVkNDVhMDQ4ZjkyODQ4ZjZmY2YwMDhkZWE2Y2YwMmFkfDFiNTczNzBkMDUwOTRkMTVhNjRkZTVkMTg3Zjc0NzMx&sdata=U05TdUUzV081K0dGbU40bTJKVjQzaHJVZzlCU0ptbG0vc2JVd3RNb2pYTT0%3D&ovuser=6ed1cffb-0bf7-4bdb-aa67-6c34e7f32bb3%2CMS084743%40flooranddecor.com "https://flooranddecor-my.sharepoint.com/:x:/r/personal/er35405_flooranddecor_com/_layouts/15/doc.aspx?sourcedoc=%7b305b7f29-93cc-4238-b94e-f622cb725e78%7d&file=fnd%20pro%20loyalty_beta%20requirements_01april2026.xlsx&action=default&mobileredirect=true&isspofile=1&xsdata=mdv8mdj8fdbiowq0mzdhota1mdrlmdljmtbhmdhkzwe2y2ywmmflfdzlzdfjzmzimgjmnzrizgjhyty3nmmzngu3zjmyymizfdb8mhw2mzkxmze2mduxnjy2mzczmjj8vw5rbm93bnxwr1zoylhovfpxtjfjbwwwzvzobgnuwnbzmly4zxlkrfftstzjbfjswvcxelgwrlvvrk5sy25acfkyvmzvmujqveu5r0lpd2lwauk2swpbdu1dnhdnref3swl3avvdstzjbgrwympneulpd2lrvtrpt2lkugrhagxjaulzswxkvulqb3hnwda9fdf8tdjob1lyunpmeku1t20xbfpyunbibwrmvdfkwk5wbfvhelzatwxsmfqxunjnazfeturct1ywchjurljuzwxwvvfyuk9la0y2v21wak5fmuvtvfjhukvgm1fium9jbvzowkm1mk1poxrawe56wvdkbgn5ohhoemmztlrzek56rtfnrev3fdvkndvhmdq4zjkyodq4zjzmy2ywmdhkzwe2y2ywmmfkfdfintcznzbkmduwotrkmtvhnjrkztvkmtg3zjc0nzmx&sdata=u05tduuzv081k0dgbu40btjkvjqzahjvzzlcu0ptbg0vc2jvd3rnb2pytt0%3d&ovuser=6ed1cffb-0bf7-4bdb-aa67-6c34e7f32bb3%2cms084743%40flooranddecor.com")


CEM - store manager (chief executive manager?)
ECOMM - team that manages F&D Website

- right now there are thousands of records in CRM that have the same email associated to them.
- when someone changes their number to one that someone else has, if they prove they own it, then we rip it off of the other record and attach it to the new record.
- Conversion of data is going to be huge.
- Two companies/accounts can't have the same email address.
- Need to find out how to create delegate relationships from company to compay (I want all delegates from this company to be able to be my delegate)
- Contacts are not allowed to have the same phone number anymore. You must have email OR phone.
- All Contacts get accounts. Only 4% of accounts have data on them right now. We need to fix that going forward.
- POS searches by phone, attached order to contact
	- for refunds, communication, order history, attribution
- No higher level/business merging conversations have happened (not beta scope yet, maybe not even full launch scope). At a high-level, we aren't trying to make great effort to merge accounts. Customers need to choose one and move forward with that going forward.
- The store cannot sign people up as delegates for an account.
- Every Contact MUST be the owner of at least one account (personal household account). So if they merge accounts and lose theirs, they will have a new one created eventually? What about account owners who don't have a household one?
- If we allow people to choose between personal and company buying, they may attribute everything to themselves...and get all the benefits. ==This is an issue to bring up again later.== How do you keep them from doing this? Accepted credit cards???
- There is a sheet with launch and beta requirements. ==Ask for it from Alex/Jasmine/Ashley==.
- Only one phone for every contact going forward (always resolves to one contact).
- For commercial, there are day laborers with no contact/account. They need a QR code from the commercial entity.
- Orion owns order service, the api will need account IDs now, and contact IDs, etc. Need to store more metadata on the sale (POS needs to).
- - Last 7 days count towards rewards, and last year counts towards tier calculations. (enrollment recognition is loyalty engine) -- REDEEM & REWARD (for new enrollment, 30 days for spend attribution, 7 days for rewards)
- Everything the pro has, commercial should have (colleen said so).
- There is a lot of fraud around merging accounts.
- Who does the updates of offline mode of POS.
- Link orders to accounts.
- Spend = spend / year.
- CSAT - cusotmer satisfaction?
- Sabrena to ask Krystal if we should do receipt correction if it was attributed to the wrong account (people can get territorial about their receipts, and why things are disappearing from their accounts).

# Questions
- how does ECOMM login tie into loyalty/crm?
- is email address the unique identifier in CRM? you need to show all accounts a customer is assigned to... (we match on email first and as priority, then phone number) -- what if they are different? email matches, phone doesn't. -- only send text message to what is attached to the order, not in CRM.
- phone AND email are unique in contact, AND email at account level (==dig into this more - clarify with Ashley/Lane==)
- Should we allow landlines? It breaks the MFA flow (unless we use a voice way).
- What happens when someone changes their email address? Do they get a new record? (==dig into this more==)
- Is the account the same as the main person? (owner)? Or do they have a contact as well? Why do we have an account email?
- What happens if the ownership changes?
- Would an account owner contact ever have a different email than the account?
- how to do account merge scenario?
- What is amperity? - account deduping company Evan is hiring.
- What do we do about multiple phone numbers on an account (do we allow it)? (need a primary?)  
- What happens when we find out that two companies are actually the same? How would we notice? (phase 2 - merging accounts) -- how often would this happen?
	- When you merge, how would that affect the ledger for Audit?
- Find out what to do with two people from the same company and they are attached to different accounts (owner invites them into the main account? remove the old account)
- What if they are co-owners of an account?
- Does it make sense to have a personal vs business account (two different object types in Salesforce)? - I don't think it will make much sense.
- Ask business if the QR code is one-time use. Are there any financial concerns with this?
- Think through what the POS flow is like, what they would need from loyalty engine for that contact.
- Where will membership IDs need to be?
- What edge cases come with associating credit cards to accounts. (sounds like we would let them decide to add a credit card to their account).
- what is a tender?
- For deactivating or merging rewards from accounts, what do we do?
	- after 12 months of no sales, the account is inactive. 10 months we send email saying we will set your balance at 0 soon.
- Sabrena can help with merge accounts. She has done that in the past.
- They are not called "gift cards" or "f&d bucks" - You can get redemption of cash via checks probably after you get a certain amount of them (via ACH maybe)? user experience -- you are x% close to getting your $50 reward (goes into an aggregate bank account - Sabrena likes that).
- Taking away rewards that are monetary (because of returns) may need to go by legal. You shouldn't take away rewards. you take away spend. 
- 12 month inactivity expiration.
- Need to define the exact rules for fraud issues (do what's right by the customer, up to $200 increments)
- IME - installation made easy (3rd party install company)
- Memberships (in loyalty engine) can have multiple accounts (one person has two companies that have shared loyalty -- maybe one in florida and one in georgia). An account can only have 1 membership.
	- should delegates be assigned to accounts or memberships? (accounts probably)
- Why would homeowners want to give pros that pickup their stuff store credit?

# 4/30 meeting - 
- Josh - Senior director of services (pro & design for store and execution).
- Emma.
- Correcting rewards going to the wrong account.
- What happens when someone doesn't give info and get rewards during purchase. Can they retroactively do it?
- Product Management through ECommerce Side (Alicia)
- Sabrena - loyalty systems rollouts, senior product manager
- Customer pays, pro gets receipt, pro gets rewards in pro app (picture of receipt). Or take picture of transaction number.

# People
Krystal -> Trey -> Alicia -> Sydney
Krystal -> Rollin (data and analytics)

# Learnings
## tokens with credit cards (xref? Magic Number?)


it sounds like it's a 16 digit string with the last 4 numbers the same as the pan on the credit card (what is a pan?) and can be used for paying later? Does that sound right?

Yes — you’re describing something very close to how many payment systems work.

A **PAN** stands for:

> **Primary Account Number**

That is the actual credit card number on the card.

For example:

```
4111 1111 1111 1111
```

The PAN is usually:

- 15–19 digits
- most commonly 16 digits for Visa/Mastercard

---

## About the token looking similar to the card

There are different kinds of tokens.

One common type is a **network token** or **payment token** that:

- may still be 16 digits long
- may preserve the last 4 digits
- may even resemble a card number format

Example:

```
Real PAN:   4111 1111 1111 1234Token PAN:  4895 2300 9988 1234
```

Notice:

- different underlying number
- same last 4 digits

The last 4 are often preserved because:

- customers recognize them
- receipts/display systems use them
- customer support uses them

---

## Can the token be used for future payments?

Yes — that is often the point.

The token can frequently be used:

- for future purchases
- recurring billing
- refunds
- card-on-file transactions

But:

- only within authorized systems
- often only by that merchant or processor
- under controlled rules

So the token becomes a reusable stand-in for the PAN.

---

## Important nuance

There are two broad categories people often mix together:

### 1. Merchant/processor token

Random identifier like:

```
tok_abcd1234
```

- Usually not card-shaped
- Only meaningful to the payment processor

### 2. Network token / tokenized PAN

Looks like an actual card number:

```
5200 0000 0000 1234
```

- Often 16 digits
- Used by Apple Pay, Google Pay, modern POS systems
- Can route through payment networks like a normal card

What you’re describing sounds more like the second kind.

---

## Simple mental model

- **PAN** = the real card number
- **Token** = a safer replacement number
- **Tender** = the payment method saved on the account

So a system may:

1. Customer uses Visa card
2. Processor creates a tokenized PAN
3. Merchant saves token as a tender on customer account
4. Merchant can charge later without storing the real PAN



# 4/30 meeting - 
- Josh - Senior director of services (pro & design for store and execution).
- Emma.
- Correcting rewards going to the wrong account.
- What happens when someone doesn't give info and get rewards during purchase. Can they retroactively do it?
- Product Management through ECommerce Side (Alicia)
- Sabrena - loyalty systems rollouts, senior product manager
- Customer pays, pro gets receipt, pro gets rewards in pro app (picture of receipt). Or take picture of transaction number.