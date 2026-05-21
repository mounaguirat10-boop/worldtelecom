import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const metrics = await db.networkMetric.findMany({ orderBy: { date: 'desc' } })
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, uptime, latency, throughput, errors } = body
    if (!date || uptime === undefined || latency === undefined) {
      return NextResponse.json({ error: 'التاريخ والقياسات مطلوبة' }, { status: 400 })
    }
    const metric = await db.networkMetric.create({
      data: { date: new Date(date), uptime: Number(uptime), latency: Number(latency), throughput: Number(throughput), errors: Number(errors) }
    })
    return NextResponse.json(metric, { status: 201 })
  } catch (error) {
    console.error('Error creating metric:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف القياس مطلوب' }, { status: 400 })
    await db.networkMetric.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting metric:', error)
    return NextResponse.json({ error: 'خطأ في حذف السجل' }, { status: 500 })
  }
}
