import os
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings

def get_vectorstore(openai_api_key: str):
    persist_dir = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_db")
    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
    return Chroma(
        collection_name="personacore_memory",
        embedding_function=embeddings,
        persist_directory=persist_dir
    )
