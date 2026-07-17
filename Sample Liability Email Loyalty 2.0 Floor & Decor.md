# Sample delivery email

> This is a mock of the monthly delivery email so Jacie can confirm the format. The key SOX detail is the **control totals in the body** (row counts + dollar totals) that match each attached CSV.

---

**To:** [loyalty-liability@flooranddecor.com](mailto:loyalty-liability@flooranddecor.com); [zpion@flooranddecor.com](mailto:zpion@flooranddecor.com) **From:** [loyalty-reporting@flooranddecor.com](mailto:loyalty-reporting@flooranddecor.com) **Subject:** Loyalty Liability Reports — June 2026 (Reporting Period 2026-06)

Hi all,

Attached are the three monthly Loyalty Liability reports for **June 2026**. Control totals are listed below so you can confirm each CSV is complete before loading.

**Reporting period:** 2026-06-01 through 2026-06-30 **Generated:** 2026-07-01 02:15 ET **Basis:** Delivered sales only, membership-ID grain

|#|Report|File|Rows|Dollar total|
|---|---|---|---|---|
|1|Sales Detail (transaction level)|`1-sales-detail-2026-06.csv`|12|$46,228.35 (net delivered sales)|
|2|YTD Sales Summary|`2-ytd-sales-summary-2026-06.csv`|6|$162,781.60 (YTD delivered sales)|
|3|Awards Roll-forward|`3-awards-rollforward-2026-06.csv`|4|$1,561.24 (current awards balance)|

Notes:

- **Report 1** is event-based: manual/sales assignments that became _delivered_ this month are included even if the underlying sale was from a prior month.
- **Report 2** is the year-to-date summary (a roll-up of the detail); use it to catch anything that fell out of the monthly.
- **Report 3** shows financial balances only (Rebates + F&D Dollars) — no sample/free-sample balances. The **current awards balance** column is the outstanding liability at period end.

Please reply if any control total doesn't tie out or if the columns need adjusting.

Thanks, Loyalty Reporting

---

## For review — questions for Jacie

1. Are these the columns and breakdowns (Pro / tier / election / fulfilling store) you expect on each report?
2. For control totals: is **net delivered sales** the right dollar figure for Report 1, or do you want gross sales and returns shown separately?
3. On Report 3, do you want a single roll-forward per membership, or split by award type (Rebates vs. F&D Dollars) into separate rows?
4. Is a single email with all three CSVs attached preferable, or one email per report (each with its own control total)?
5. Any additional fields (e.g., customer number alongside membership ID) you'd want available?