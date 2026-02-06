import os
import sys

try:
    import google.generativeai as genai
except ImportError:
    print("ERROR: google-generativeai not installed. Run: pip install google-generativeai")
    sys.exit(1)

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(dotenv_path=None):
        pass


class AnswerGenerator:
    def __init__(self, model_name="gemini-2.5-flash"):
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        env_file = os.path.join(backend_dir, ".env")
        if os.path.exists(env_file):
            load_dotenv(env_file)
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not set. "
                "Please add it to Backend/.env file or set as environment variable."
            )
        
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel(model_name)
            self.model_name = model_name
        except Exception as e:
            raise RuntimeError(f"Failed to configure Gemini API: {e}")
    
    def generate(self, prompt):
        if not prompt or not isinstance(prompt, str):
            raise ValueError("prompt must be a non-empty string")
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            raise RuntimeError(f"Gemini API error: {e}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Generate answer using Gemini API.")
    parser.add_argument("prompt", help="The prompt to send to Gemini")
    parser.add_argument("--model", default="gemini-2.5-flash", help="Gemini model name")
    
    args = parser.parse_args()
    
    print("=" * 80)
    print("Answer Generator - Gemini API")
    print("=" * 80)
    
    try:
        generator = AnswerGenerator(model_name=args.model)
        print(f"Model: {generator.model_name}")
        print("\nGenerating answer...\n")
        
        answer = generator.generate(args.prompt)
        
        print("Answer:")
        print("-" * 80)
        print(answer)
        print("-" * 80)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)