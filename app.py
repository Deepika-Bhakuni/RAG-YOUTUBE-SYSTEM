import streamlit as st

from backend.transcript import get_transcript

from backend.rag import (
    create_chunks,
    create_vector_store,
    ask_question
)

from backend.voice import (
    listen_question,
    speak_answer
)

from backend.pdf_export import (
    export_chat_to_pdf
)

# ---------------------------------------------------
# PAGE CONFIG
# ---------------------------------------------------

st.set_page_config(
    page_title="AI YouTube RAG Assistant",
    page_icon="🎥",
    layout="wide"
)

# ---------------------------------------------------
# TITLE
# ---------------------------------------------------

st.title("🎥 AI YouTube RAG Assistant")

st.markdown(
    "Ask questions from multiple YouTube videos using AI"
)

# ---------------------------------------------------
# VIDEO IDS
# ---------------------------------------------------

video_ids = [

    "aircAruvnKk",
    "rfscVS0vtbw"

]

# ---------------------------------------------------
# SESSION STATE
# ---------------------------------------------------

if "chat_history" not in st.session_state:

    st.session_state.chat_history = []

# ---------------------------------------------------
# LOAD RAG SYSTEM
# ---------------------------------------------------

@st.cache_resource

def load_rag_system():

    all_transcripts = []

    for video_id in video_ids:

        transcript_data = get_transcript(
            video_id
        )

        # Add video id to transcript
        for item in transcript_data:

            item["video_id"] = video_id

        all_transcripts.extend(
            transcript_data
        )

    # Create chunks
    chunks = create_chunks(
        all_transcripts
    )

    # Create vector store
    index, embeddings = create_vector_store(
        chunks
    )

    return chunks, index

# ---------------------------------------------------
# INITIALIZE SYSTEM
# ---------------------------------------------------

with st.spinner("Loading AI System..."):

    chunks, index = load_rag_system()

# ---------------------------------------------------
# SIDEBAR
# ---------------------------------------------------

st.sidebar.title("📜 Chat History")

if st.session_state.chat_history:

    for chat in st.session_state.chat_history:

        st.sidebar.markdown(
            f"**Q:** {chat['question']}"
        )

        st.sidebar.markdown(
            f"**A:** {chat['answer'][:100]}..."
        )

        st.sidebar.markdown("---")

else:

    st.sidebar.info(
        "No chat history yet."
    )

# ---------------------------------------------------
# QUESTION INPUT
# ---------------------------------------------------

question = st.text_input(
    "Ask a question"
)

# ---------------------------------------------------
# BUTTONS
# ---------------------------------------------------

col1, col2, col3 = st.columns(3)

with col1:

    ask_button = st.button(
        "🚀 Submit"
    )

with col2:

    voice_button = st.button(
        "🎤 Voice Question"
    )

with col3:

    pdf_button = st.button(
        "📄 Export PDF"
    )

# ---------------------------------------------------
# VOICE INPUT
# ---------------------------------------------------

if voice_button:

    with st.spinner("Listening..."):

        question = listen_question()

    if question:

        st.success(
            f"You said: {question}"
        )

    else:

        st.error(
            "Voice could not be recognized."
        )

# ---------------------------------------------------
# ASK QUESTION
# ---------------------------------------------------

if ask_button or voice_button:

    if question:

        with st.spinner("Generating Answer..."):

            try:

                # IMPORTANT FIX:
                # None means search ALL videos

                answer = ask_question(

                    question,
                    chunks,
                    index,
                    None,
                    st.session_state.chat_history

                )

            except Exception as e:

                st.error(
                    f"Error: {e}"
                )

                answer = None

        # ---------------------------------------------------
        # SHOW ANSWER
        # ---------------------------------------------------

        if answer:

            st.subheader("🤖 Answer")

            st.success(answer)

            # OPTIONAL:
            # Comment this if speech freezes

            speak_answer(answer)

            # Save chat history
            st.session_state.chat_history.append({

                "question": question,
                "answer": answer

            })

# ---------------------------------------------------
# EXPORT PDF
# ---------------------------------------------------

if pdf_button:

    export_chat_to_pdf(
        st.session_state.chat_history
    )

    st.success(
        "PDF Exported Successfully!"
    )

    # Download PDF
    with open(
        "chat_history.pdf",
        "rb"
    ) as pdf_file:

        st.download_button(

            label="📥 Download PDF",

            data=pdf_file,

            file_name="chat_history.pdf",

            mime="application/pdf"
        )