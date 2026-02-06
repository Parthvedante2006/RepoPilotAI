import os
import sys
import argparse

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "repo_loader"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "chunking"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "embeddings"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "vector_db"))

from github_loader import load_github_repo
from chunker import chunk_repo
from embedder import create_embeddings
from faiss_index import FaissIndex


def run_pipeline(repo_url=None):
    print("\n" + "=" * 80)
    print("RepoPilotAI - Full Pipeline Execution")
    print("=" * 80)
    
    temp_folder_path = None
    
    if repo_url:
        print(f"\n📥 Step 1: Downloading repository from GitHub...")
        print(f"   URL: {repo_url}")
        result = load_github_repo(repo_url)
        temp_folder_path = result["temp_path"]
        print(f"   ✓ Downloaded {result['files_count']} files")
        print(f"   ✓ Saved to: {temp_folder_path}")
    else:
        print("\n📁 Step 1: Using existing repository files...")
        print("   No URL provided, using latest temp folder")
    
    print(f"\n🔪 Step 2: Chunking files...")
    chunks = chunk_repo(temp_folder_path)
    print(f"   ✓ Created {len(chunks)} chunks")
    
    if len(chunks) == 0:
        print("\n⚠️  WARNING: No chunks created. Check if files match allowed extensions.")
        return
    
    print(f"\n🧠 Step 3: Generating embeddings...")
    embedded_chunks = create_embeddings(chunks)
    print(f"   ✓ Generated embeddings for {len(embedded_chunks)} chunks")
    
    print(f"\n💾 Step 4: Building FAISS index...")
    faiss_index = FaissIndex()
    faiss_index.add(embedded_chunks)
    faiss_index.save()
    print(f"   ✓ FAISS index built and saved")
    
    print("\n" + "=" * 80)
    print("✅ Pipeline execution complete!")
    print("=" * 80)
    print(f"\nSummary:")
    print(f"  - Repository files: {temp_folder_path or 'latest temp folder'}")
    print(f"  - Total chunks: {len(chunks)}")
    print(f"  - Vector dimension: {faiss_index.vector_dim}")
    print(f"  - Index location: {faiss_index.index_path}")
    print("\nYou can now use the retriever to query this repository!")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="RepoPilotAI - Process GitHub repositories for RAG-based code search"
    )
    parser.add_argument(
        "--repo",
        "-r",
        type=str,
        help="GitHub repository URL (e.g., https://github.com/user/repo)",
        default=None
    )
    
    args = parser.parse_args()
    
    try:
        run_pipeline(repo_url=args.repo)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)