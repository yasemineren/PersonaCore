from langchain_google_genai import ChatGoogleGenerativeAI
from app.core.persona import FONIFY_EMPLOYEE_V1

async def persona_drift_score(gemini_api_key: str, reply: str) -> float:
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0,
        google_api_key=gemini_api_key,
    )

    prompt = f"""
You are a strict evaluator. Score the assistant reply from 0 to 100 for compliance.

Persona tone: {FONIFY_EMPLOYEE_V1.tone}
Rules:
- """ + "\n- ".join(FONIFY_EMPLOYEE_V1.rules) + f"""

Assistant reply:
{reply}

Return ONLY a number (0-100).
"""
    msg = await llm.ainvoke(prompt)
    try:
        return float(str(msg.content).strip())
    except:
        return 50.0
