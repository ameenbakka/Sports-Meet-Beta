import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Result } from '@/lib/models/Result';
import '@/lib/models/Event';
import '@/lib/models/Category';
import '@/lib/models/Club';
import '@/lib/models/Participant';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const query = searchParams.get('query')?.toLowerCase();

    const results = await Result.find({ status: 'PUBLISHED' })
      .populate({
        path: 'eventId',
        populate: { path: 'categoryId' },
      })
      .sort({ publishedAt: -1 })
      .lean();

    let filteredResults = results;
    if (categoryId && categoryId !== 'ALL') {
      filteredResults = filteredResults.filter((r: any) => {
        return r.eventId?.categoryId?._id?.toString() === categoryId;
      });
    }

    if (query) {
      filteredResults = filteredResults.filter((r: any) => {
        const eventName = r.eventId?.name?.toLowerCase() || '';
        const p1 = r.firstPlace?.participantName?.toLowerCase() || '';
        const p2 = r.secondPlace?.participantName?.toLowerCase() || '';
        const p3 = r.thirdPlace?.participantName?.toLowerCase() || '';
        const c1 = r.firstPlace?.clubName?.toLowerCase() || '';
        return (
          eventName.includes(query) ||
          p1.includes(query) ||
          p2.includes(query) ||
          p3.includes(query) ||
          c1.includes(query)
        );
      });
    }

    return NextResponse.json({ results: filteredResults });
  } catch (error: any) {
    console.error('Public results error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
