import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notifications = await db.notification.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, priority } = body
    if (!title || !message || !type) {
      return NextResponse.json({ error: 'العنوان والمحتوى والنوع مطلوبون' }, { status: 400 })
    }
    const notification = await db.notification.create({
      data: { title, message, type, priority: priority || 'عادي' }
    })
    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isRead } = body
    if (!id) return NextResponse.json({ error: 'المعرف مطلوب' }, { status: 400 })
    const notification = await db.notification.update({ where: { id }, data: { isRead } })
    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    return NextResponse.json({ error: 'خطأ في تحديث السجل' }, { status: 500 })
  }
}
