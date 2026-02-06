import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "embeddings"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vector_db"))

from embedder import embed_texts
from faiss_index import FaissIndex


class Retriever:
    def __init__(self, faiss_index_path=None, vector_dim=None):
        if faiss_index_path is None:
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            faiss_index_path = os.path.join(backend_dir, "data", "vector_store", "index.faiss")
        
        self.faiss_index_path = faiss_index_path
        self.vector_dim = vector_dim
        
        if not os.path.exists(faiss_index_path):
            raise FileNotFoundError(f"FAISS index not found at: {faiss_index_path}")
        
        self.faiss = FaissIndex(
            vector_dim=vector_dim,
            index_path=faiss_index_path
        )
        self.faiss.load()
        
        if self.vector_dim is None:
            self.vector_dim = self.faiss.vector_dim

    def retrieve(self, question, top_k=5):
        if not question or not isinstance(question, str):
            raise ValueError("question must be a non-empty string")
        
        if top_k < 1:
            raise ValueError("top_k must be at least 1")
        
        if self.faiss.index.ntotal == 0:
            raise ValueError("FAISS index is empty")
        
        query_vector = embed_texts([question])[0]
        
        if len(query_vector) != self.vector_dim:
            raise ValueError(
                f"Query vector dimension ({len(query_vector)}) doesn't match "
                f"index dimension ({self.vector_dim})"
            )
        
        results = self.faiss.search(query_vector, top_k=top_k)
        
        return results


if __name__ == "__main__":
    import argparse
    
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "reasoning"))
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "generator"))
    
    from query_decomposer import QueryDecomposer
    from safety_check import SafetyCheck
    from prompt_builder import build_prompt
    from answer_generator import AnswerGenerator
    
    parser = argparse.ArgumentParser(description="Full RAG pipeline: Question to Answer")
    parser.add_argument("question", help="The question to search for")
    parser.add_argument(
        "--top-k",
        type=int,
        default=5,
        help="Number of top results to return (default: 5)"
    )
    parser.add_argument(
        "--index-path",
        type=str,
        help="Path to FAISS index (defaults to Backend/data/vector_store/index.faiss)"
    )
    
    args = parser.parse_args()
    
    print("\n" + "=" * 80)
    print("RepoPilotAI - Full RAG Pipeline")
    print("=" * 80)
    print(f"\n📝 Question: {args.question}\n")
    
    try:
        print("🔍 Step 1: Retrieving relevant code chunks...")
        retriever = Retriever(faiss_index_path=args.index_path)
        print(f"   ✓ Loaded FAISS index (dimension: {retriever.vector_dim})")
        print(f"   ✓ Index contains {retriever.faiss.index.ntotal} vectors")
        
        chunks = retriever.retrieve(args.question, top_k=args.top_k)
        print(f"   ✓ Found {len(chunks)} relevant chunks\n")
        
        print("🧠 Step 2: Analyzing question intent...")
        decomposer = QueryDecomposer()
        question_type = decomposer.decompose(args.question)
        print(f"   ✓ Question type: {question_type['type']}")
        print(f"   ✓ Confidence: {question_type['confidence']}")
        print(f"   ✓ Reason: {question_type['reason']}\n")
        
        print("🛡️  Step 3: Safety check...")
        safety_checker = SafetyCheck()
        safety_result = safety_checker.check(question_type, chunks)
        
        if not safety_result['allowed']:
            print(f"   ❌ Safety check FAILED: {safety_result['reason']}")
            print("\n" + "=" * 80)
            print("⚠️  Cannot answer this question safely.")
            print("=" * 80 + "\n")
            sys.exit(0)
        
        print(f"   ✓ Safety check PASSED: {safety_result['reason']}")
        if 'warning' in safety_result:
            print(f"   ⚠️  Warning: {safety_result['warning']}")
        print()
        
        print("📋 Step 4: Building prompt...")
        prompt = build_prompt(args.question, chunks)
        print(f"   ✓ Prompt built ({len(prompt)} characters)\n")
        
        print("🤖 Step 5: Generating answer with Gemini...")
        generator = AnswerGenerator()
        print(f"   ✓ Using model: {generator.model_name}")
        answer = generator.generate(prompt)
        print(f"   ✓ Answer generated\n")
        
        print("=" * 80)
        print("📖 FINAL ANSWER")
        print("=" * 80)
        print(f"\n{answer}\n")
        print("=" * 80)
        print("\n✅ Pipeline completed successfully!\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)