class SafetyCheck:
    def __init__(self, min_chunks=2, min_text_length=50, max_distance=1.0):
        self.min_chunks = min_chunks
        self.min_text_length = min_text_length
        self.max_distance = max_distance
    
    def check(self, question_type, retrieved_chunks):
        if not isinstance(retrieved_chunks, list):
            return {
                "allowed": False,
                "reason": "Invalid chunks format"
            }
        
        if len(retrieved_chunks) == 0:
            return {
                "allowed": False,
                "reason": "No relevant code chunks found in the repository"
            }
        
        if len(retrieved_chunks) < self.min_chunks:
            return {
                "allowed": False,
                "reason": f"Not enough context (found {len(retrieved_chunks)}, need at least {self.min_chunks})"
            }
        
        valid_chunks = []
        for chunk in retrieved_chunks:
            text = chunk.get("text", "")
            if text and len(text.strip()) >= self.min_text_length:
                valid_chunks.append(chunk)
        
        if len(valid_chunks) == 0:
            return {
                "allowed": False,
                "reason": "Retrieved chunks are too short or empty"
            }
        
        if "distance" in retrieved_chunks[0]:
            avg_distance = sum(c.get("distance", 0) for c in retrieved_chunks) / len(retrieved_chunks)
            if avg_distance > self.max_distance:
                return {
                    "allowed": False,
                    "reason": f"Retrieved chunks are not relevant enough (avg distance: {avg_distance:.2f})"
                }
        
        if question_type.get("type") == "overview" and len(valid_chunks) < 5:
            return {
                "allowed": False,
                "reason": "Overview questions require more context (need at least 5 chunks)"
            }
        
        if question_type.get("confidence") == "low":
            return {
                "allowed": True,
                "reason": "Low confidence in question intent, but sufficient context available",
                "warning": "Question intent unclear, answer may not be precise"
            }
        
        return {
            "allowed": True,
            "reason": f"Sufficient relevant context found ({len(valid_chunks)} chunks)"
        }


if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description="Check if answering is safe.")
    parser.add_argument("--chunks", type=int, default=3, help="Number of chunks retrieved")
    parser.add_argument("--qtype", default="explanation", help="Question type")
    parser.add_argument("--confidence", default="high", help="Confidence level")
    
    args = parser.parse_args()
    
    mock_chunks = [
        {"file": f"file{i}.py", "chunk_id": i, "text": "def example(): pass" * 10, "distance": 0.2}
        for i in range(args.chunks)
    ]
    
    question_type = {"type": args.qtype, "confidence": args.confidence}
    
    checker = SafetyCheck()
    result = checker.check(question_type, mock_chunks)
    
    print(json.dumps(result, indent=2))