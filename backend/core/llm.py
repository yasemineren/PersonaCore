from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

def get_llm(api_key: str, model_name: str = "gemini-2.0-flash"):
    if not api_key:
        raise ValueError("API Key zorunludur!")
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=0.7
    )
