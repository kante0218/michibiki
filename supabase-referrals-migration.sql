-- Connections table (LinkedIn imports)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  position TEXT,
  connected_on TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_name TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'application_started', 'application_completed', 'offer_extended', 'hired', 'paid')),
  reward_amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own connections" ON connections FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own referrals" ON referrals FOR ALL USING (auth.uid() = referrer_id);
