# Summary of Needs from Loyalty Engine Team
ECOMM APIs - review (all are represented above - ==still need to message the group== - [Sotto, Mitchell [CONTRACTOR]: Just sent an email. Here is the AI summary. Action i... | Loyalty 2.0 Discussion | Microsoft Teams](https://teams.microsoft.com/l/message/19:meeting_MDQ3NTUzZWMtMGE5Ni00YzBjLThiZGUtOWUwZTkwN2M5N2Fj@thread.v2/1784223509804?context=%7B%22contextType%22%3A%22chat%22%7D))
- Get the **timeline for Order History design** delivery from the Loyalty team — pending vs. actual. _(Due Wed July 22)_
- Provide **timelines for holding benefits from web checkout against the Loyalty Engine** — when it enters dev, plus specs.
- Define the **loyalty simulation endpoint** (earnings based on current cart): endpoints + timelines for contract and dev deployment. Set up a meeting. Clarify what it returns — Pro Bucks earned? Resulting tier from spend? Or accrual only?
- Discuss with team and confirm with **Derek & Paul** that we can support the Order History Detail accrual box (pending vs. actual accrual saved on the order).
- Define what parameters **ECOMM needs to send the rules engine** to evaluate benefit-usage eligibility, and what the call returns (boolean? amount?). Determine whether the sales feed needs an identifier showing the benefit use was approved. _(Loyalty Engine to decide.)_
- **(ECOMM/Loyalty/CRM) Notification preferences** meeting — meeting needed on what's required from CRM and how to update it (beta vs. full launch). Notes: no notifications to the website; no SMS opt-in from the app for October. Mark Holland wants it for Beta (aware Sydney removed it from the app for Beta) — need to confirm CRM is committed for Beta, and whether it routes through CRS.
- Hold endpoint timeline

# Raw Notes (helpful)
**A. BFF Contract**

**1.**AUTH contracts — full picture of authentication/authorization contracts for the BFF: token model, session handling, scopes per service, and what the client is expected to pass.
- no change in current WIMS authenticated token. 
	- Note - BFF loads all Order History for ECOMM & App

2. Service-specific contracts — definition and status of BFF contracts for each downstream domain: **Payments** ==(bff is proxy only)==, **Loyalty**, ~~**CRM**~~, **Order History**. What exists, what's drafted, what's not started? Timeline for endpoint availability (critical path — everything is downstream of this).
- (Mitchell) Loyalty Team - ==timeline== on when we will get Order History designed and out. (pending vs actual) (by Wed July 22)
- (Jarrod) Endpoints for auth in dev timeline - ==timelines tbd== (by July 22 - Wed?) - Jarrod
- (Karl) Holding benefits from web checkout against Payments - ==timelines for when it is in dev== (contracts in place)
- (Mitchell) Holding benefits from web checkout against Loyalty Engine - ==timelines for when it is in dev== ==(specs as well)==

- Web Order XML - conversation 7/17
- (Derek/ECOMM) Tell Paul/Jarrod what they need in BFF for communicating with Payments.

**B. My Account Architecture / Scope Boundaries**

  
3. For all other My Account context — account data, contact preferences, PPR enrollment/banner, etc. — do we rely on current-state integrations (i.e., _not_ sitting behind the BFF)? Where is the line drawn between BFF-fronted and legacy-integrated data, and is that boundary stable or transitional?
	
- (Derek) What is missing from the CRS that ECOMM already gets that isn't present in the data you've seen thus far?

- (ECOMM) Notification preferences - ==needs meeting to discuss what is needed from CRM and how to update (beta/full launch, etc.)==
	- - Note - no notifications needed to the website. Also no opting into SMS from the app for October. Mark Holland wants it for Beta, he knows that Sydney took it out of app for Beta. (==CRM committed to this for Beta?==) Maybe not through CRS.
	- ![[Pasted image 20260716111933.png]]
	- ![[Pasted image 20260716111945.png]] (future)

**C. Loyalty Engine — Accrual & Context**

  
4. Future accrual rates — how do we determine the applicable accrual rate when a customer far exceeds the threshold to the next accrual lump sum? Does the engine return forward-looking rates, or only current-tier state?
- (Mitchell) simulation endpoint for how much will be earned based on what you're spending now (current cart). ==- endpoints and timelines for contract and dev work deployment - meeting==
	- what is returned by this? Is it how much bucks earned? and what tier you get because of spend? Or just earned accrual?

  
5. Loyalty context caching — can we store loyalty context without hitting the engine on every interaction? Proposal: force refreshes at defined checkpoints only — cart load, cart→checkout transition, checkout billing step arrival. Need alignment that this is acceptable (staleness tolerance, invalidation events) — we should not be calling the engine at all times.
- No issues. Please check with Sydney on the rules around when you're doing it.

5. Will we get the cash rebate money applicable to any given order for Order Details? or just the aggregate view in My Account?
- Order History page only shows spend accrued per order. You redeemed X benefits on this order as well.
- Order History Detail page - we save pending vs actual accrual on the order in Loyalty Engine. This should support the page below. The SIMULATE endpoint may be different from the silver box below (but that is shown at checkout). ==- (Mitchell) Confirm with Derek & Paul that we can support this.==
	- ![[Pasted image 20260716114128.png|638]]

7. Returns/adjustments — if an order is partially returned after accrual becomes available, does the box restate the adjusted amount, or does the correction live only in benefit history? Recommend the box always shows the ledger's current value for the order.

8. Visibility into Pro Bucks Earned, Redeemed, Pending - from Loyalty Engine? POS Balance Ledger?

**D. Transactional Write-Back (Place Order)**

  
9. What do the loyalty write-back contracts at place-order look like — Hold/Burn, Void/Refund, and the full lifecycle in between (partial cancels, re-ships, adjustments)?

  
10. (Full Rollout) Pro Bucks / benefits expiration — is it confirmed we will _not_ receive expiration dates on Pro Bucks/benefits? If confirmed, what's the customer-facing implication and mitigation?

**E. Delivery Qualification & Benefits Application**

  
11. Source of truth for tier-based delivery qualification (cheaper vs. FREE delivery) — the idea is to hit the Loyalty Engine to differentiate. Can the engine return the actual value distinction (e.g., **$279 vs. FREE**)? Do we need to pass the PBS reason code for it to resolve correctly? And how do we make this scalable across channels (web, store, other)?
- Rules
	- If bidroom order over 10k, we will give them free shipping for the whole thing.
	- Over $2000k (maximum spend $279)
- (Mitchell) What parameters does ECOMM need to send the rules engine to evaluate benefit usage ability? How will we return from this call? boolean? amount? etc? Does the sales feed need an identifier to show that the benefit use was approved (the interaction between ECOMM and rules engine happened)? Loyalty engine to decide
- ==Samples unlimited on all tiers???== ~Sydney. ==Fraud algorithm needed by loyalty engine for this?==
  
12. Limitless delivery subsidy for Project Bid Support — how do we ensure PBS delivery subsidy is not capped? (Related to #11 — reason code handling.)

  
13. Benefits pass-down — how do we pass benefits used down through the order? **Overrides** appears to be the approach — need confirmation and alignment on the **reason code** taxonomy.

**F. Tax (RDF / Avalara)**

  
14. Can we confirm all FREE deliveries and FREE samples still qualify for RDF? Working assumption is yes — which would require an iteration in how we interact with Avalara. Need confirmation of the assumption and scoping of the Avalara change.
- RDF - retail delivery fee (Colorado especially). Will we still need the fee? Derek to confirm with Tax team.
- (Paul) Need to do testing of Tax Mapping for these changes (math validations).
	- WORS would need to be able to display new tenders in MWOP. To integrate with OMS as well. (Meeting 6/17)

**G. Order XML / Tender**

  
15. How do we pass the tender down? Do we map **all** commit payload response attributes as custom attributes in the web order XML, or a curated subset? (Ties to Friday's web order XML discussion — Nikolay to bring XML with Hannah's Jira context.)

**H. Data Mockups**

16. We need dummy customer data to be able to test