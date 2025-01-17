-- Insert initial municipalities (Istanbul districts)
INSERT INTO municipalities (name, city, boundaries) VALUES
    ('Kadıköy', 'Istanbul', ST_GeomFromText('POLYGON((29.0 40.9, 29.1 40.9, 29.1 41.0, 29.0 41.0, 29.0 40.9))', 4326)),
    ('Üsküdar', 'Istanbul', ST_GeomFromText('POLYGON((29.0 41.0, 29.1 41.0, 29.1 41.1, 29.0 41.1, 29.0 41.0))', 4326)),
    ('Beşiktaş', 'Istanbul', ST_GeomFromText('POLYGON((28.9 41.0, 29.0 41.0, 29.0 41.1, 28.9 41.1, 28.9 41.0))', 4326));

-- Insert system admin user (password: admin123)
INSERT INTO users (email, password_hash, role) VALUES
    ('admin@municipal-feedback.com', '$2b$10$xhV7xK3HTK9m8HF5dG5kB.zG.OZgZm1ZEPd1BB/GgHoQ8.Zh2Jy6y', 'system_admin');

-- Insert municipality admin users (password: admin123)
INSERT INTO users (email, password_hash, role, municipality_id) VALUES
    ('kadiköy@municipal-feedback.com', '$2b$10$xhV7xK3HTK9m8HF5dG5kB.zG.OZgZm1ZEPd1BB/GgHoQ8.Zh2Jy6y', 'municipality_admin', (SELECT id FROM municipalities WHERE name = 'Kadıköy')),
    ('uskudar@municipal-feedback.com', '$2b$10$xhV7xK3HTK9m8HF5dG5kB.zG.OZgZm1ZEPd1BB/GgHoQ8.Zh2Jy6y', 'municipality_admin', (SELECT id FROM municipalities WHERE name = 'Üsküdar')),
    ('besiktas@municipal-feedback.com', '$2b$10$xhV7xK3HTK9m8HF5dG5kB.zG.OZgZm1ZEPd1BB/GgHoQ8.Zh2Jy6y', 'municipality_admin', (SELECT id FROM municipalities WHERE name = 'Beşiktaş'));

-- Insert test citizen users (password: user123)
INSERT INTO users (email, password_hash, role) VALUES
    ('user1@example.com', '$2b$10$xhV7xK3HTK9m8HF5dG5kB.zG.OZgZm1ZEPd1BB/GgHoQ8.Zh2Jy6y', 'citizen'),
    ('user2@example.com', '$2b$10$xhV7xK3HTK9m8HF5dG5kB.zG.OZgZm1ZEPd1BB/GgHoQ8.Zh2Jy6y', 'citizen');

-- Insert test feedback
INSERT INTO feedback (description, category, status, location, address, user_id, municipality_id) VALUES
    ('Street cleaning needed', 'cleaning', 'pending', 
     ST_SetSRID(ST_MakePoint(29.05, 40.95), 4326),
     'Caferağa Mahallesi, Kadıköy',
     (SELECT id FROM users WHERE email = 'user1@example.com'),
     (SELECT id FROM municipalities WHERE name = 'Kadıköy')),
    ('Broken street light', 'infrastructure', 'in_progress',
     ST_SetSRID(ST_MakePoint(29.02, 41.05), 4326),
     'Mimar Sinan Mahallesi, Üsküdar',
     (SELECT id FROM users WHERE email = 'user2@example.com'),
     (SELECT id FROM municipalities WHERE name = 'Üsküdar'));

-- Insert test subscriptions
INSERT INTO subscriptions (municipality_id, plan, status, valid_until) VALUES
    ((SELECT id FROM municipalities WHERE name = 'Kadıköy'), 'premium', 'active', CURRENT_TIMESTAMP + INTERVAL '1 year'),
    ((SELECT id FROM municipalities WHERE name = 'Üsküdar'), 'basic', 'active', CURRENT_TIMESTAMP + INTERVAL '1 year'),
    ((SELECT id FROM municipalities WHERE name = 'Beşiktaş'), 'enterprise', 'active', CURRENT_TIMESTAMP + INTERVAL '1 year'); 