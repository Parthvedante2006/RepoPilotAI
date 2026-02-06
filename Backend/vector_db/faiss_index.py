import faiss
import numpy as np
import pickle
import os
import sys


class FaissIndex:
    def __init__(self, vector_dim=None, index_path=None):
        if index_path is None:
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            index_dir = os.path.join(backend_dir, "data", "vector_store")
            os.makedirs(index_dir, exist_ok=True)
            index_path = os.path.join(index_dir, "index.faiss")
        
        self.index_path = index_path
        self.vector_dim = vector_dim
        self.index = None
        self.metadata = []
        
        if vector_dim is not None:
            self.index = faiss.IndexFlatL2(vector_dim)

    def add(self, embedded_chunks):
        if not embedded_chunks:
            raise ValueError("embedded_chunks cannot be empty")
        
        if self.index is None:
            first_vector = embedded_chunks[0]["vector"]
            self.vector_dim = len(first_vector)
            self.index = faiss.IndexFlatL2(self.vector_dim)
            print(f"Initialized FAISS index with dimension: {self.vector_dim}")
        
        vectors = []
        for chunk in embedded_chunks:
            vector = chunk["vector"]
            if len(vector) != self.vector_dim:
                raise ValueError(f"Vector dimension mismatch: expected {self.vector_dim}, got {len(vector)}")
            
            vectors.append(vector)
            self.metadata.append({
                "file": chunk["file"],
                "chunk_id": chunk["chunk_id"],
                "text": chunk["text"]
            })

        vectors = np.array(vectors).astype("float32")
        self.index.add(vectors)
        print(f"Added {len(vectors)} vectors to FAISS index (total: {self.index.ntotal})")

    def search(self, query_vector, top_k=5):
        if self.index is None or self.index.ntotal == 0:
            raise ValueError("Index is empty. Add vectors before searching.")
        
        query_vector = np.array([query_vector]).astype("float32")
        distances, indices = self.index.search(query_vector, top_k)

        results = []
        for i, idx in enumerate(indices[0]):
            if idx >= 0 and idx < len(self.metadata):
                result = self.metadata[idx].copy()
                result["distance"] = float(distances[0][i])
                results.append(result)

        return results

    def save(self):
        if self.index is None or self.index.ntotal == 0:
            raise ValueError("Cannot save empty index")
        
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        faiss.write_index(self.index, self.index_path)
        
        with open(self.index_path + ".meta", "wb") as f:
            pickle.dump({
                "metadata": self.metadata,
                "vector_dim": self.vector_dim
            }, f)
        
        print(f"Saved FAISS index to: {self.index_path}")
        print(f"Total vectors: {self.index.ntotal}")

    def load(self):
        if not os.path.exists(self.index_path):
            raise FileNotFoundError(f"Index file not found: {self.index_path}")
        
        if not os.path.exists(self.index_path + ".meta"):
            raise FileNotFoundError(f"Metadata file not found: {self.index_path}.meta")
        
        self.index = faiss.read_index(self.index_path)
        
        with open(self.index_path + ".meta", "rb") as f:
            data = pickle.load(f)
            self.metadata = data["metadata"]
            self.vector_dim = data["vector_dim"]
        
        print(f"Loaded FAISS index from: {self.index_path}")
        print(f"Total vectors: {self.index.ntotal}")
        print(f"Vector dimension: {self.vector_dim}")


if __name__ == "__main__":
    import argparse
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "embeddings"))
    from embedder import create_embeddings
    
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "chunking"))
    from chunker import chunk_repo

    parser = argparse.ArgumentParser(description="Build FAISS index from repo chunks.")
    parser.add_argument(
        "temp_folder_path",
        nargs="?",
        help="Path to temp folder (defaults to latest repopilot_* in Backend/data/repo_temp)",
    )
    args = parser.parse_args()

    print("=" * 80)
    print("FAISS Index Builder - Full Pipeline")
    print("=" * 80)
    
    print("\nStep 1: Loading chunks from repo...")
    chunks = chunk_repo(args.temp_folder_path)
    print(f"✓ Loaded {len(chunks)} chunks")

    print("\nStep 2: Generating embeddings...")
    embedded_chunks = create_embeddings(chunks)
    print(f"✓ Generated embeddings for {len(embedded_chunks)} chunks")

    print("\nStep 3: Building FAISS index...")
    faiss_index = FaissIndex()
    faiss_index.add(embedded_chunks)
    print(f"✓ Built FAISS index")

    print("\nStep 4: Saving index to disk...")
    faiss_index.save()
    print(f"✓ Index saved successfully")
    
    print("\n" + "=" * 80)
    print("Pipeline complete!")
    print("=" * 80)
