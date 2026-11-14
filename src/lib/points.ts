import { Club } from './models/Club';
import { Result } from './models/Result';
import mongoose from 'mongoose';

export async function recalculateAllClubPoints(tenantId?: string | mongoose.Types.ObjectId) {
  const filter: any = {};
  if (tenantId) {
    filter.tenantId = tenantId;
  }

  // 1. Reset matching clubs to 0 points and 0 medal counts
  await Club.updateMany(
    filter,
    { $set: { totalPoints: 0, goldCount: 0, silverCount: 0, bronzeCount: 0 } }
  );

  // 2. Fetch published results for tenant
  const resultFilter: any = { status: 'PUBLISHED' };
  if (tenantId) {
    resultFilter.tenantId = tenantId;
  }
  const results = await Result.find(resultFilter);

  // 3. Accumulate points per club
  const clubStats: Record<string, { total: number; gold: number; silver: number; bronze: number }> = {};

  for (const res of results) {
    if (res.firstPlace && res.firstPlace.clubId) {
      const cId = res.firstPlace.clubId.toString();
      if (!clubStats[cId]) clubStats[cId] = { total: 0, gold: 0, silver: 0, bronze: 0 };
      clubStats[cId].total += res.firstPlace.pointsAwarded || 5;
      clubStats[cId].gold += 1;
    }
    if (res.secondPlace && res.secondPlace.clubId) {
      const cId = res.secondPlace.clubId.toString();
      if (!clubStats[cId]) clubStats[cId] = { total: 0, gold: 0, silver: 0, bronze: 0 };
      clubStats[cId].total += res.secondPlace.pointsAwarded || 3;
      clubStats[cId].silver += 1;
    }
    if (res.thirdPlace && res.thirdPlace.clubId) {
      const cId = res.thirdPlace.clubId.toString();
      if (!clubStats[cId]) clubStats[cId] = { total: 0, gold: 0, silver: 0, bronze: 0 };
      clubStats[cId].total += res.thirdPlace.pointsAwarded || 1;
      clubStats[cId].bronze += 1;
    }
  }

  // 4. Update each club with new aggregated totals
  for (const [clubId, stats] of Object.entries(clubStats)) {
    await Club.findByIdAndUpdate(clubId, {
      $set: {
        totalPoints: stats.total,
        goldCount: stats.gold,
        silverCount: stats.silver,
        bronzeCount: stats.bronze,
      },
    });
  }
}
