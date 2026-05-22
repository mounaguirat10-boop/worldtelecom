import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `أنت مساعد ذكي لشركة WORLD TELECOM في تونس. متخصص في:
- تحليل بيانات الأعمال والإيرادات
- إدارة المخزون وسلسلة التوريد
- دعم العملاء وحل المشكلات
- توصيات الاستثمار الرقمي
- مراقبة أداء الشبكة
أجب دائماً باللغة العربية بشكل مهني ومختصر.`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    if (!message) return NextResponse.json({ error: 'الرسالة مطلوبة' }, { status: 400 })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=` + process.env.GEMINI_API_KEY,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: message }] }]
        })
      }
    )

    const data = await response.json()
    if (!response.ok) {
      console.error('Gemini error:', JSON.stringify(data))
      return NextResponse.json({ response: 'عذراً، حدث خطأ.' })
    }

    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'عذراً، حدث خطأ.'
    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ response: 'عذراً، حدث خطأ.' })
  }
}

