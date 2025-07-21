import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { status } = await request.json();

  // In a real application, you would update the order status in your database
  // For now, we'll simulate a successful update
  console.log(`Updating order ${id} status to: ${status}`);

  if (!status) {
    return NextResponse.json({ message: 'Status is required' }, { status: 400 });
  }

  // Simulate a delay for API call
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({ message: `Order ${id} status updated to ${status}` });
}