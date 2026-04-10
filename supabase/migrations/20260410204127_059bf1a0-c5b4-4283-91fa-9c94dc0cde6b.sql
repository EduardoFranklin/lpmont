DELETE FROM message_queue WHERE lead_id IN ('1e60ddcb-67c7-413f-a090-66215e05e82d', '69dede04-59e6-4e62-ad1e-51863c7a215a');
DELETE FROM lead_tags WHERE lead_id IN ('1e60ddcb-67c7-413f-a090-66215e05e82d', '69dede04-59e6-4e62-ad1e-51863c7a215a');
DELETE FROM leads WHERE id IN ('1e60ddcb-67c7-413f-a090-66215e05e82d', '69dede04-59e6-4e62-ad1e-51863c7a215a');