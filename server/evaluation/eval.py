import os
import tempfile
import streamlit as st
import pandas as pd
from datasets import Dataset
from dotenv import load_dotenv

from ragas import evaluate
from ragas.metrics import (
    answer_relevancy, 
    answer_similarity,
)

from ragas.llms import llm_factory, LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper

from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings
)
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores.faiss import FAISS
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# -------------------- CONFIG --------------------
FAISS_PATH = "./faiss_store_eval"
load_dotenv()

# -------------------- LLM SETUP --------------------
client = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

gemini_llm = llm_factory(
    "gemini-2.5-flash",
    provider="google",
    client=client
)
ragas_llm = LangchainLLMWrapper(gemini_llm)

embeddings = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)
ragas_emb = LangchainEmbeddingsWrapper(embeddings)

# -------------------- STREAMLIT UI --------------------
st.set_page_config(page_title="Resume RAG Evaluation", layout="wide")
st.title("📄 Resume Screening with RAG Evaluation")

uploaded_file = st.file_uploader("Upload Resume PDF", type=["pdf"])
job_description = st.text_area(
    "📌 Paste Job Description",
    height=200,
    placeholder="Paste the job role / JD here..."
)

if uploaded_file and job_description:
    with st.spinner("Processing resume..."):
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(uploaded_file.getbuffer())
            tmp_path = tmp_file.name

        loader = PyPDFLoader(tmp_path)
        docs = loader.load()
        os.remove(tmp_path)

        splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
        chunks = splitter.split_documents(docs)

        vectorstore = FAISS.from_documents(chunks, embeddings)
        vectorstore.save_local(FAISS_PATH)

        retriever = vectorstore.as_retriever(search_kwargs={"k": 6})

    st.success("Resume indexed successfully!")

    # -------------------- RAG PROMPT --------------------
    template = """
You are an assistant for analyzing resume contents.

{question}

Resume Context:
{context}

Rules:
- Answer strictly in ONE line
- Answer ONLY as: "Yes — <quoted evidence>" OR "No — not mentioned"
- Do NOT explain
- Do NOT infer
"""

    prompt = ChatPromptTemplate.from_template(template)

    rag_chain = (
        {
            "context": retriever,
            "question": RunnablePassthrough()
        }
        | prompt
        | client
        | StrOutputParser()
    )
    
    skill_prompt = f"""
Extract a list of concrete technical skills, tools, or frameworks
from the following job description.
Return ONLY a comma-separated list.

Job Description:
{job_description}
"""

    skills_text = client.invoke(skill_prompt).content
    st.write("🔍 Extracted Skills:", skills_text)
    skills = [s.strip() for s in skills_text.split(",")][:5]

    questions = [f"Does the resume mention {skill}?" for skill in skills]
    
    # ✅ FIX: Create proper ground truth references
    references = [
        f"Check if {skill} appears in the resume" for skill in skills
    ]

    if st.button("Run Evaluation"):
        answers = []
        contexts = []

        with st.spinner("Running RAG + Evaluation..."):
            for q in questions:
                query = f"""
Job Description:
{job_description}

Question:
{q}
"""
                
                ans = rag_chain.invoke(query)
                answers.append(ans)

                ctx_docs = retriever.invoke(query)
                ctx_list = [d.page_content for d in ctx_docs]
                contexts.append(ctx_list)

            # ✅ Create dataset with required format
            dataset = Dataset.from_dict({
                "question": questions,
                "answer": answers,
                "contexts": contexts,
                "ground_truth": references  # ✅ Use ground_truth instead of reference
            })

            # ✅ Use simpler metrics that work with your data
            result = evaluate(
                dataset,
                metrics=[
                    answer_relevancy,   # How relevant is the answer to the question
                    answer_similarity,  # How similar to ground truth
                ],
                llm=ragas_llm,
                embeddings=ragas_emb
            )
            
            df = result.to_pandas()
            
            st.write("### Raw Metrics")
            st.dataframe(df)
            
            # ✅ Calculate score from valid metrics
            metric_cols = ["answer_relevancy", "answer_similarity"]
            valid_metrics = df[metric_cols].dropna(axis=1, how="all")
            
            if not valid_metrics.empty:
                df["resume_match_score"] = (
                    valid_metrics.mean(axis=1) * 100
                ).round(2)
            else:
                df["resume_match_score"] = 0.0

        st.subheader("📊 Final Results")
        st.dataframe(df, use_container_width=True)
        
        final_score = df["resume_match_score"].mean().round(2)

        st.metric(
            label="📈 Resume Match Score",
            value=f"{final_score} / 100"
        )

        st.subheader("🧠 Model Answers")
        for i, q in enumerate(questions):
            st.markdown(f"**Q:** {q}")
            st.markdown(f"**A:** {answers[i]}")
            st.divider()