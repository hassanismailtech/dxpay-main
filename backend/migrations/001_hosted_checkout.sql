-- Apply once to an existing local database before using reloadable invoices.
ALTER TABLE Transactions ADD COLUMN IF NOT EXISTS payment_url TEXT;
