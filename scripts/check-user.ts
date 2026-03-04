import { db } from '../lib/db/index';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function checkUser() {
  const user = await db.query.users.findFirst({
    where: eq(users.email, 'organizer@gmail.com'),
  });

  if (user) {
    console.log('User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      hasPasswordHash: !!user.passwordHash,
    });
  } else {
    console.log('User NOT found in database');
  }

  process.exit(0);
}

checkUser().catch(console.error);
