import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const items = await db.inventoryItem.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productName, category, quantity, minQuantity, unitPrice, supplier, barcode, imageUrl } = body
    if (!productName || !category || quantity === undefined || unitPrice === undefined) {
      return NextResponse.json({ error: 'اسم المنتج والفئة والكمية والسعر مطلوبون' }, { status: 400 })
    }
    const item = await db.inventoryItem.create({
      data: {
        productName, category,
        quantity: Number(quantity),
        minQuantity: Number(minQuantity) || 10,
        unitPrice: Number(unitPrice),
        supplier: supplier || null,
        barcode: barcode || null,
        imageUrl: imageUrl || null,
      }
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json({ error: 'خطأ في إنشاء السجل' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 })
    await db.inventoryItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json({ error: 'خطأ في حذف السجل' }, { status: 500 })
  }
}
