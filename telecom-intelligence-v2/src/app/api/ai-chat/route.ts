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

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://worldtelecom.vercel.app',
        'X-Title': 'WORLD TELECOM'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ]
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('OpenRouter error:', JSON.stringify(data))
      return NextResponse.json({ response: 'عذراً، حدث خطأ.' })
    }

    const aiResponse = data.choices?.[0]?.message?.content || 'عذراً، حدث خطأ.'
    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ response: 'عذراً، حدث خطأ.' })
  }
}

