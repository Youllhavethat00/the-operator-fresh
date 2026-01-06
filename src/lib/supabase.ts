import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://njxvhivjdfyheshnicgq.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjZjNzY2MTQzLTI1OGEtNDc5MC05YzZlLTEzZWYwZjlkZDlhYSJ9.eyJwcm9qZWN0SWQiOiJuanh2aGl2amRmeWhlc2huaWNncSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY2Mjk3MjgwLCJleHAiOjIwODE2NTcyODAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.aLOAmecO8FR-wi7US_9buoqW7wrG294nnBzGZ6n6vsw';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };