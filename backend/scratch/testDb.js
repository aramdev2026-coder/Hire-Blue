import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const count = await prisma.otpToken.count();
    console.log('OTP Tokens count:', count);
    const candidateCount = await prisma.candidate.count();
    console.log('Candidates count:', candidateCount);
  } catch (e) {
    console.error('DB Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
