import re


class QueryDecomposer:
    def __init__(self):
        self.patterns = {
            "location": [
                r"\bwhere\s+(is|are|does)\b",
                r"\bwhich\s+file\b",
                r"\bin\s+which\b",
                r"\bfind\s+(the)?\s*(file|class|function)\b",
                r"\blocate\b",
            ],
            "explanation": [
                r"\bhow\s+(does|do|is|are)\b",
                r"\bexplain\b",
                r"\bwhat\s+(does|is|are)\b",
                r"\bwhy\s+(does|is)\b",
                r"\bdescribe\b",
                r"\bshow\s+me\b",
            ],
            "impact": [
                r"\bwhat\s+happens\s+if\b",
                r"\bwhat\s+would\s+happen\b",
                r"\bif\s+I\s+change\b",
                r"\bimpact\s+of\b",
                r"\beffect\s+of\b",
                r"\bconsequence\b",
            ],
            "overview": [
                r"\bsummarize\s+(the)?\s*repo\b",
                r"\boverview\s+of\b",
                r"\bexplain\s+the\s+(entire|whole)\b",
                r"\bwhat\s+(does\s+)?this\s+repo\s+do\b",
                r"\bgeneral\s+structure\b",
            ],
        }
    
    def decompose(self, question):
        if not question or not isinstance(question, str):
            return {"type": "unknown", "confidence": "low", "reason": "Empty or invalid question"}
        
        question_lower = question.lower().strip()
        
        if len(question_lower) < 3:
            return {"type": "unknown", "confidence": "low", "reason": "Question too short"}
        
        scores = {qtype: 0 for qtype in self.patterns}
        
        for qtype, patterns in self.patterns.items():
            for pattern in patterns:
                if re.search(pattern, question_lower):
                    scores[qtype] += 1
        
        max_score = max(scores.values())
        
        if max_score == 0:
            return {"type": "unknown", "confidence": "low", "reason": "No recognizable intent pattern"}
        
        detected_type = max(scores, key=scores.get)
        
        confidence = "high" if max_score >= 2 else "medium" if max_score == 1 else "low"
        
        return {
            "type": detected_type,
            "confidence": confidence,
            "reason": f"Matched {max_score} pattern(s) for {detected_type}"
        }


if __name__ == "__main__":
    import argparse
    import json
    
    parser = argparse.ArgumentParser(description="Analyze question intent.")
    parser.add_argument("question", help="The question to analyze")
    
    args = parser.parse_args()
    
    decomposer = QueryDecomposer()
    result = decomposer.decompose(args.question)
    
    print(json.dumps(result, indent=2))