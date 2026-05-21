import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const emails = await db.email.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(emails)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { from, to, subject, body: emailBody, status, priority } = body
    if (!from || !to || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const email = await db.email.create({
      data: { from, to, subject, body: emailBody || '', status: status || 'مسودة', priority: priority || 'عادي' }
    })
    return NextResponse.json(email, { status: 201 })
  } catch (err) {
    console.error('Email create error:', err)
    return NextResponse.json({ error: 'Failed to create email' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    await db.email.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete email' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, isRead, starred, status } = body
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })
    const updateData: Record<string, unknown> = {}
    if (typeof isRead === 'boolean') updateData.isRead = isRead
    if (typeof starred === 'boolean') updateData.starred = starred
    if (status) updateData.status = status
    const email = await db.email.update({ where: { id }, data: updateData })
    return NextResponse.json(email)
  } catch {
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}
