import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const tickets = await db.supportTicket.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, subject, description, priority, status } = body
    if (!customerName || !subject || !description) {
      return NextResponse.json({ error: 'اسم العميل والموضوع والوصف مطلوبون' }, { status: 400 })
    }
    const ticket = await db.supportTicket.create({
      data: { customerName, subject, description, priority: priority || 'متوسط', status: status || 'مفتوح' }
    })
    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف التذكرة مطلوب' }, { status: 400 })
    await db.supportTicket.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json({ error: 'خطأ في حذف السجل' }, { status: 500 })
  }
}
