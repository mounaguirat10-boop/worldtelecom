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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: message }]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Anthropic error:', JSON.stringify(data))
      return NextResponse.json({ response: 'عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.' })
    }

    const aiResponse = data.content?.[0]?.text || 'عذراً، حدث خطأ.'
    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ response: 'عذراً، حدث خطأ.' })
  }
}