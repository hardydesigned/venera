
# Use a pipeline as a high-level helper

from transformers import pipeline

messages = [
    {"role": "user", "content": "Who are you?"},
]
pipe = pipeline("text-generation", model="MaziyarPanahi/calme-3.2-instruct-78b")
pipe(messages)


# Load model directly

from transformers import AutoTokenizer, AutoModelForCausalLM

tokenizer = AutoTokenizer.from_pretrained("MaziyarPanahi/calme-3.2-instruct-78b")
model = AutoModelForCausalLM.from_pretrained("MaziyarPanahi/calme-3.2-instruct-78b")
