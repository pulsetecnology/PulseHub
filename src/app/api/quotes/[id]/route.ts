import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { action } = await request.json(); // action can be 'approve' or 'reject'

  // In a real application, you would update the quote status in your database
  // and potentially convert it to an order if approved.
  console.log(`Updating quote ${id} with action: ${action}`);

  if (!action || (action !== 'approve' && action !== 'reject')) {
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }

  // Simulate a delay for API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({ message: `Quote ${id} ${action}d successfully` });
}