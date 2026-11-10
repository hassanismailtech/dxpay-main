-- 1. Providers (Labs, Imaging Centers, Hospitals)
CREATE TABLE Providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL -- e.g., 'lab', 'imaging', 'hospital'
);
-- 2. Tests (Diagnostic services offered)
CREATE TABLE Tests (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    provider_id INTEGER REFERENCES Providers(id) ON DELETE CASCADE
);
-- 3. Orders (The aggregated bill for the patient)
CREATE TABLE Orders (
    id VARCHAR(50) PRIMARY KEY,
    -- You can use UUIDs or custom strings like 'ORD-123'
    patient_name VARCHAR(255) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    -- 'pending', 'successful', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 4. OrderItems (Connecting individual tests to a specific order)
CREATE TABLE OrderItems (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES Orders(id) ON DELETE CASCADE,
    test_id INTEGER REFERENCES Tests(id),
    provider_id INTEGER REFERENCES Providers(id),
    price DECIMAL(10, 2) NOT NULL
);
-- 5. Transactions (Forge sandbox collection records; not bank settlement)
CREATE TABLE Transactions (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES Orders(id) ON DELETE CASCADE,
    transaction_reference VARCHAR(255) UNIQUE NOT NULL,
    payment_url TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 6. PaymentSplits (Local provider allocations only; no bank settlement)
CREATE TABLE PaymentSplits (
    id SERIAL PRIMARY KEY,
    transaction_id VARCHAR(50) REFERENCES Transactions(id) ON DELETE CASCADE,
    provider_id INTEGER REFERENCES Providers(id),
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'allocated'
);