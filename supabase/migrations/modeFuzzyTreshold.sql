ALTER TABLE irrigation_schedule 
ADD COLUMN IF NOT EXISTS irrigation_mode text DEFAULT 'threshold' 
CHECK (irrigation_mode IN ('threshold', 'fuzzy_logic'));

-- Update data yang sudah ada
UPDATE irrigation_schedule 
SET irrigation_mode = 'threshold' 
WHERE irrigation_mode IS NULL;

-- Tambahkan komentar
COMMENT ON COLUMN irrigation_schedule.irrigation_mode IS 
'Mode pengambilan keputusan penyiraman: threshold (berdasarkan nilai ambang) atau fuzzy_logic (logika fuzzy)';