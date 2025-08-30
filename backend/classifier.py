import os
import json
from openai import OpenAI
from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "../.env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise RuntimeError("OPENAI_API_KEY isn't definida. Configure a variável de ambiente ou o .env")

client = OpenAI(api_key=api_key)

def classify_email(email_text: str):
    prompt = f"""
    Você é um classificador de emails.
    Leia o email abaixo e retorne SOMENTE um JSON válido (sem texto extra, sem explicações) no formato:

    {{
      "Categoria": "Produtivo" ou "Improdutivo",
      "Resposta": " Olá "nome do remetente", "Mensagem curta e educada". Atenciosamente, "
    }}

    Categorias:
    - Produtivo: emails que exigem ação ou resposta.
    - Improdutivo: emails sem necessidade de ação imediata.

    Email:
    {email_text}
    """

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        max_completion_tokens=200,
        temperature=0
    )

    content = response.choices[0].message.content.strip()

    try:
        result =json.loads(content)
    except json.JSONDecodeError:
        import re
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            result = json.loads(match.group(0))
        else:
            result = {"Categoria": "Improdutivo", "Resposta": "Não foi possível classificar o email."}

    return result