import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'ac');
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Agent context file not found', { status: 404 });
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (err) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
