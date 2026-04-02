#!/bin/bash
sed -i '' '536,637c\
                {filteredUsers.map((u, idx) => (\
                  <UserRow \
                    key={u.id} \
                    idx={idx} \
                    u={u} \
                    showPasswords={showPasswords} \
                    handleResetPassword={handleResetPassword} \
                    handleDeleteUser={handleDeleteUser} \
                  />\
                ))}
' src/pages/Admin.jsx
