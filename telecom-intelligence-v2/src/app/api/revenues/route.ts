import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const revenues = await db.revenue.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(revenues)
  } catch (error) {
    console.error('Error fetching revenues:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { month, amount, target, category } = body
    if (!month || amount === undefined || target === undefined || !category) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 })
    }
    const revenue = await db.revenue.create({ data: { month, amount: Number(amount), target: Number(target), category } })
    return NextResponse.json(revenue, { status: 201 })
  } catch (error) {
    console.error('Error creating revenue:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف الإيراد مطلوب' }, { status: 400 })
    await db.revenue.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting revenue:', error)
    return NextResponse.json({ error: 'خطأ في حذف السجل' }, { status: 500 })
  }
}
