import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { CareerReportDoc } from './CareerReportDoc';

export async function POST(req: NextRequest) {
  const { result, bigFive, riasec } = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(CareerReportDoc as any, { result, bigFive, riasec });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="careerfind-report.pdf"',
    },
  });
}
