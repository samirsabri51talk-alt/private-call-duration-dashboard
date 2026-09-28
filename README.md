# Private Call Duration Dashboard

Paste the grouped IS Call Report into the dashboard and load it. The parser recognizes team headers, agent rows, first and last call, total and valid calls, effective-call rate, total effective minutes, and average call time.

## DingTalk delivery

The production backend must hold the DingTalk robot code and group IDs as deployment secrets. They must never be committed to GitHub or included in browser JavaScript. Once a robot is selected and added to the target group, the dashboard can send a generated report through that backend.

## Local-only B.S Team delivery

1. Copy `.env.example` to `.env`.
2. Put the B.S Team custom robot webhook in `DINGTALK_WEBHOOK_URL` (and the signing secret in `DINGTALK_SECRET` if signing is enabled). Keep `.env` local; it is ignored by Git.
3. Run `node local-server.js` from this folder.
4. Open `http://127.0.0.1:8787`, paste/load the report, then click **Send to B.S Team**.
