import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const customers = await db.customer.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, address, serviceType, status } = body
    if (!name || !phone || !serviceType) {
      return NextResponse.json({ error: 'الاسم والهاتف ونوع الخدمة مطلوبون' }, { status: 400 })
    }
    const customer = await db.customer.create({
      data: { name, phone, email: email || null, address: address || null, serviceType, status: status || 'نشط' }
    })
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف العميل مطلوب' }, { status: 400 })
    await db.customer.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json({ error: 'خطأ في حذف السجل' }, { status: 500 })
  }
}
