- Can a contact appear on multiple accounts** with different roles?
	- Wouldn't this be based on the credit card? - At checkout, the POS must ask: **"Which account is this purchase for?"** — because Jake's purchase attributes differently depending on the answer.
- What is this? - Homeowner_Flag	Boolean	PENDING DECISION. Recommendation: add it now — cheap to add, expensive later.
- Do only pros get enrolled in a tier? Or do all customers?
- What threshhold? - High-Value Review	Redemptions above a threshold go to manual review queue	Human review for large point spends
- Why wouldn't pos just pass to the loyalty engine and the engine passes to the ledger? Probably because it's one less hop from POS which is better for SOX       ⑤	POS → Loyalty Ledger	Transaction events	Event bus (real-time)	❌ ⑥	Loyalty Engine → POS	Points balance, tier, rewards	REST API (real-time)	❌
- How do we know they aren't lieing? - 1. Portal asks: "Are you the business owner for [Business Name]?"
- ==URGENT== - we need to talk to finance. Every feature decision affects financial liability. Longer expiration windows = more liability on the books. Higher earn rates = faster liability accumulation. ==Finance has veto power on any change that significantly alters the liability model.==
- I need to understand why this is a big problem.4. "How does this work for the multi-account delegate?" When to ask: When POS flows, app features, or account management is discussed. Why it works: The delegate-on-multiple-accounts scenario is the most complex edge case. Raising it shows you've thought through the data model deeply.
- Please give me more information this piece: Architecture Reviews, Focus: Know the event bus pattern, the integration contracts by number, the API surface. Reference specific endpoint names (/account/{id}/status, /redeem, /earn).
- How should we handle these different edge cases? Anticipate edge cases: Multi-account delegates, unmappable contacts, loyalty engine downtime, return-after-redeem scenarios. Raising these shows depth.
- 


# made up?
- (franchises?) - National parent orgs are **reference only** — they do NOT receive or aggregate loyalty benefits

# Notes
- **Critical design point:** The tier engine runs asynchronously after each transaction via the event bus. It does NOT block the POS checkout. If the loyalty engine is down, the tier evaluation is queued and catches up via daily reconciliation.
- If anyone asks why the Ledger is a separate system from the Engine, you can say:  _"The Loyalty Engine calculates the rules, but the Loyalty Ledger is for SOX compliance. Every time a customer earns points, we create a financial liability on F&D's balance sheet under ASC 606. The independent Ledger gives auditors an immutable, transaction-level trail of exactly when and why every point was awarded, protecting us if the core engine logic ever misfires incorrectly calculates a calculation bug."_
- 💡 The "Expert" Meeting Context (Decision #6) If this comes up in a meeting, you have a perfect opportunity to bring up one of the 10 Open Technical Decisions (specifically, Decision #6 regarding Delegate Permissions). What you can say in the meeting: "Right now, the account owner has to generate a QR code and text it to their runner, or use BOPIS, because we are launching with a binary permission model (only the owner can redeem). However, post-launch, if we move to a configurable permission model, the owner could explicitly grant a trusted foreman the 'Redeem Status' so that specific delegate could trigger redemptions at the POS on their own."
- ==When anyone proposes changing earn rates, expiration windows, or reward values, say: "What does Finance say about the liability impact? Under ASC 606, every point is deferred revenue on the balance sheet." This shows business acumen that most developers don't have.==
- - **Mitigation 1 (Auditing):** The master account owner (the true employer) should have a dashboard showing all purchases made by authorized buyers. If Jake buys materials but routing them to a different loyalty account, the employer will notice a discrepancy. - **Mitigation 2 (Payment Matching):** POS systems at the PRO desk can flag or block transactions if a corporate credit card is used but the loyalty account attached to the purchase does not match the corporate entity. - **Mitigation 3 (Receipts):** The receipt should clearly print the name of the loyalty account the points were credited to, adding a layer of transparency.
- 7. So what should a multi-user do? Do they have 2 logins? **No. Never force multiple logins.** They should have **one login profile** tied to their personal identity (e.g., Jake's phone number or email and a single password).  Once authenticated, the UI provides a **Context Switcher** (just like switching between profiles on Netflix or workspaces in Slack). Jake clicks a dropdown that says "Buying for: Company A" or "Buying for: Company B". The single identity token maps to multiple underlying loyalty account IDs.
- ### 8. Return-after-redeem flow details
	- If a customer buys a $1,000 saw, earns 1,000 points, immediately spends the 1,000 points on a drill, and then returns the saw for a $1,000 refund, they have effectively stolen the drill. Here is how programs handle this:
		- **Approach 1: Deferred Earning (Preventative - Recommended)**  
		    Points generated from a purchase sit in a "Pending" state and cannot be redeemed until the standard 30-day return window elapses. If the item is returned during that window, the pending points are simply wiped.
		- **Approach 2: Negative Balances (Reactive)**  
		    Points are available immediately. If they spend the points and _then_ return the saw, the system deducts 1,000 points from their balance. If their balance is zero, it goes to **-1,000**. The next time they buy something, their new points go toward "paying off" the debt before they can earn positive, usable points again.
		- **Approach 3: Refund Clawback (Reactive & Aggressive)**  
		    If they earned and spent 1,000 points (worth $10) and return the $1,000 saw, the POS queries the loyalty ledger. It sees the points were spent, so the POS only authorizes a **$990 cash refund**, clawing back the value of the spent points. (This is the most airtight from a finance perspective, but the hardest to implement technically at the POS).

Adjusting