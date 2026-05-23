import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { scoreBigFive, scoreRIASEC, extractLifestyle } from '@/lib/scoring';
import { SYSTEM_PROMPT, buildAnalysisPrompt } from '@/lib/prompts';
import { getAllColleges } from '@/lib/colleges';
import careersData from '@/data/careers.json';
import type { SessionAnswers } from '@/lib/scoring';

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { answers }: { answers: SessionAnswers } = await req.json();

    const bigFive = scoreBigFive(answers);
    const riasec = scoreRIASEC(answers);
    const lifestyle = extractLifestyle(answers);
    const colleges = getAllColleges();

    const prompt = buildAnalysisPrompt(
      answers,
      bigFive,
      riasec,
      lifestyle,
      JSON.stringify(colleges),
      JSON.stringify(careersData),
    );

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 });
    }

    const parsed = JSON.parse(content.text);
    return NextResponse.json({ result: parsed, bigFive, riasec, lifestyle });
  } catch (err) {
    console.error('Analysis error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
