# !pip install llama-cpp-python

from llama_cpp import Llama

llm = Llama.from_pretrained(
	repo_id="unsloth/gemma-3-12b-it-GGUF",
	filename="gemma-3-12b-it-BF16.gguf",
)
