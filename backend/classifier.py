from process_email import process_email

def classify_email(text: str) -> str:
    cleaned_text = process_email(text)

    #Mock keywords
    productive_keywords = ["reunião", "projeto", "deadline", "relatório", "horário"]
    unproductive_keywords = ["zoeira", "parabéns", "festa", "promoção", "oferta", "brincadeira"]

    if any(word in cleaned_text for word in productive_keywords):
        return "Produtivo"
    elif any(word in cleaned_text for word in unproductive_keywords):
        return "Improdutivo"
    else:
        raise ValueError("Não foi possível classificar este email através de keywords")
