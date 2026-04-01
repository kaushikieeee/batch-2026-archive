const fs = require('fs');
let sql = fs.readFileSync('supabase/all_in_one_godmode.sql', 'utf8');
if (!sql.includes('-- Drop obsolete students table if applicable')) {
    sql += `
-- -------------------------------------------------
-- Relink keys and drop old students
-- -------------------------------------------------
alter table if exists public.student_messages
  drop constraint if exists student_messages_student_id_fkey;

alter table if exists public.student_messages
  add constraint student_messages_student_id_fkey
  foreign key (student_id) references public.users(id) on delete cascade;

-- Allow godmode to bypass password change automatically
update public.users set must_change_password = false where is_admin = true;
`
    fs.writeFileSync('supabase/all_in_one_godmode.sql', sql);
}
console.log('Appended relationship fix.');
