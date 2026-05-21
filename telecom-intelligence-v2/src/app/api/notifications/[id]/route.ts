import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.notification.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'فشل في حذف الإشعار' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const notification = await db.notification.update({
      where: { id },
      data: { isRead: body.isRead },
    })
    return NextResponse.json(notification)
  } catch (error) {
    return NextResponse.json({ error: 'فشل في تحديث الإشعار' }, { status: 500 })
  }
}
