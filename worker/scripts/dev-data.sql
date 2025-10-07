-- DEV-ONLY: Insert test users and data
-- Delete existing test users first
DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%blubyai.com');
DELETE FROM user_preferences WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%blubyai.com');
DELETE FROM user_allergies WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%blubyai.com');
DELETE FROM user_intolerances WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%blubyai.com');
DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%blubyai.com');
DELETE FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%blubyai.com');
DELETE FROM users WHERE email LIKE '%blubyai.com';

-- Insert test users
INSERT INTO users (id, email, name, email_verified, created_at, updated_at) VALUES
('dev-user-id', 'testuser@blubyai.com', 'Test User', 1, strftime('%s', 'now'), strftime('%s', 'now')),
('friend1-id', 'friend1@blubyai.com', 'Friend One', 1, strftime('%s', 'now'), strftime('%s', 'now')),
('friend2-id', 'friend2@blubyai.com', 'Friend Two', 1, strftime('%s', 'now'), strftime('%s', 'now')),
('friend3-id', 'friend3@blubyai.com', 'Friend Three', 1, strftime('%s', 'now'), strftime('%s', 'now'));

-- Insert accounts for test users (password: password1234)
INSERT INTO accounts (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES
('account-dev', 'testuser@blubyai.com', 'credential', 'dev-user-id', 'password1234', strftime('%s', 'now'), strftime('%s', 'now')),
('account-friend1', 'friend1@blubyai.com', 'credential', 'friend1-id', 'password1234', strftime('%s', 'now'), strftime('%s', 'now')),
('account-friend2', 'friend2@blubyai.com', 'credential', 'friend2-id', 'password1234', strftime('%s', 'now'), strftime('%s', 'now')),
('account-friend3', 'friend3@blubyai.com', 'credential', 'friend3-id', 'password1234', strftime('%s', 'now'), strftime('%s', 'now'));

-- Insert user profiles
INSERT INTO user_profiles (user_id, goal, avatar_url) VALUES
('dev-user-id', 'Maintain healthy lifestyle', 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser@blubyai.com'),
('friend1-id', 'Build muscle mass', 'https://api.dicebear.com/7.x/avataaars/svg?seed=friend1@blubyai.com'),
('friend2-id', 'Lose weight', 'https://api.dicebear.com/7.x/avataaars/svg?seed=friend2@blubyai.com'),
('friend3-id', 'Improve endurance', 'https://api.dicebear.com/7.x/avataaars/svg?seed=friend3@blubyai.com');

-- Insert dev session (token: dummysession1234)
INSERT INTO sessions (id, expires_at, token, created_at, updated_at, user_id) VALUES
('dev-session-id', strftime('%s', 'now', '+365 days'), 'dummysession1234', strftime('%s', 'now'), strftime('%s', 'now'), 'dev-user-id');

-- Insert some sample preferences for dev user
INSERT INTO user_preferences (user_id, preference) VALUES
('dev-user-id', 'vegetarian'),
('dev-user-id', 'high-protein');

-- Insert some sample allergies for dev user
INSERT INTO user_allergies (user_id, allergy) VALUES
('dev-user-id', 'peanuts'),
('dev-user-id', 'shellfish');

-- Insert some sample intolerances for dev user
INSERT INTO user_intolerances (user_id, intolerance) VALUES
('dev-user-id', 'lactose');
