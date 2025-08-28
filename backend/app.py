from fastapi import FastAPI, Form

app = FastAPI(title="Email Classifier - AutoU")

#allow CORS later if necessary

@app.post("/read")
async def read_email(text: str = Form(...)):
    clean_text = preprocess_text(text)
    category = classify_email(clean_text)
    response = generate_response(category)

    return {
        "category": category,
        "response": response
    }
