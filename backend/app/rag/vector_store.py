import os

from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings


def get_vectorstore(gemini_api_key: str):
    persist_dir = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=gemini_api_key,
    )
    return Chroma(
        collection_name="personacore_memory",
        embedding_function=embeddings,
        persist_directory=persist_dir,
    )
