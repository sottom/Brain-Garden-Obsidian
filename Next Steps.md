Build out the data domain of:
- Loyalty Engine
- CRM

End goal
- a list of all the needed fields we need and why (accepted by the group) - start with Excel sheet.



# Needs
- Functional spec
- Data Domain. A single file with a section for each system containing all the needed / available fields for the Loyalty 2.0 program related to CARS. It should be a representation of the data that will be stored by these systems. Please include any systems / databases you think are missing that will satisfy the requirements related to the CARS service.
	- CRM
	- Loyalty Engine (placeholder)
	- Payments / Ledger (placeholder)
	- QR code use-case (metadata related to it)
	- CARS Audit Database (dig into)
- Help us determine the key:value pairs we might want in the QR code data domain based on the feedback in /Users/Mitchell.Sotto/Documents/code/flooranddecorrepos/loyalty-2.0-library/intake/domain_model/cars-data-domain/CARS-crm-data-contract.xlsx in the modifications and notes columns.
- We need a list of all the system to system use-cases / interactions in a list that we can look through and approve or reject. This is a single file with a section for each system's interactions with the CARS service, and includes all of the data flows / handshakes between the systems and CARS.
- create data domain for api-contracts (cars to bff, cars to CRM, vica versa)
- Update functional spec based on data domain and data flows defined.
	- ==Based on the files in /Users/Mitchell.Sotto/Documents/code/flooranddecorrepos/loyalty-2.0-library/domain-model/api-entities describing the contacts between systems, please update the functional spec (/Users/Mitchell.Sotto/Documents/code/flooranddecorrepos/loyalty-2.0-library/functional-design/CARS-functional-design-spec.md) with more detail and also correct any incorrect information. Use the api-entities as the source of truth.==
- Architecture one-level-down, technical design and constraints.
- Iterate
- Implementation plan - get here today (6/12)
- Build it.
- Test it based on use-cases?
- Deploy it.
