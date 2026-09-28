# Private Call Duration Dashboard

Paste the grouped IS Call Report into the dashboard and load it. The parser recognizes team headers, agent rows, first and last call, total and valid calls, effective-call rate, total effective minutes, and average call time.

## DingTalk delivery

The production backend must hold the DingTalk robot code and group IDs as deployment secrets. They must never be committed to GitHub or included in browser JavaScript. Once a robot is selected and added to the target group, the dashboard can send a generated report through that backend.
