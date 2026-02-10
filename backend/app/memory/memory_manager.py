from app.rag.vector_store import get_vectorstore


def write_long_term(gemini_api_key: str, contact_id: str, text: str, kind: str = "note") -> str:
    vs = get_vectorstore(gemini_api_key)
    doc_id = f"{contact_id}:{kind}"
    vs.add_texts([text], metadatas=[{"contact_id": contact_id, "kind": kind}], ids=[doc_id])
    vs.persist()
    return doc_id


def search_long_term(gemini_api_key: str, contact_id: str, query: str, k: int = 4) -> list[dict]:
    vs = get_vectorstore(gemini_api_key)
    results = vs.similarity_search_with_score(query, k=k)
    filtered = []
    for doc, score in results:
        if doc.metadata.get("contact_id") == contact_id:
            filtered.append({"text": doc.page_content, "score": float(score), "meta": doc.metadata})
    return filtered
