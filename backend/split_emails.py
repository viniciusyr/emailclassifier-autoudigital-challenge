import re

def split_emails(text: str):
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if "From:" in text or "De:" in text:
        parts = re.split(r"(?=^From:|^De:)", text, flags=re.MULTILINE)
    else:
        parts = re.split(r"(?=Olá|Bom dia|Boa tarde|Boa noite|Prezado|Prezada)", text, flags=re.IGNORECASE)
    return [p.strip() for p in parts if len(p.strip()) > 20]