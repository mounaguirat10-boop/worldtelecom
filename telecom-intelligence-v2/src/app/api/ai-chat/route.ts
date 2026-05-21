import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

const SYSTEM_PROMPT = `أنت مساعد ذكي لشركة WORLD TELECOM في تونس. متخصص في:
- تحليل بيانات الأعمال والإيرادات
- إدارة المخزون وسلسلة التوريد
- دعم العملاء وحل المشكلات
- توصيات الاستثمار الرقمي
- مراقبة أداء الشبكة
- خدمات البيع والتركيب والإصلاح

معلومات الشركة:
- الاسم: WORLD TELECOM
- المدير: Mehrez ALOUI (Gérant)
- الأخصائية: GUIRAT Mouna (Informaticienne)
- الموقع: تونس العاصمة، تونس
- النشاط: بيع، تركيب، إصلاح ومعدات هاتفية

أجب دائماً باللغة العربية بشكل مهني ومفيد. كن مختصراً وواضحاً. استخدم بيانات واقعية عند تقديم إحصائيات.`

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'الرسالة مطلوبة' },
        { status: 400 }
      )
    }

    const zai = await ZAI.create()

    const response = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      thinking: { type: 'disabled' }
    })

    const aiResponse = response.choices[0]?.message?.content || 'عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.'

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('AI Chat error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في معالجة الطلب' },
      { status: 500 }
    )
  }
}
