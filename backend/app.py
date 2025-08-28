from fastapi import FastAPI, Form, UploadFile
from classifier import classify_email
from response_generator import generate_response
from process_email import process_email


app = FastAPI(title="Email Classifier - AutoU")

#allow CORS later if necessary
@app.post("/read")
async def read_email(text: str = Form(None), file: UploadFile = None):

    content = ""

    if file:
        content = (await file.read()).decode("utf-8", erros="ignore")
    elif text:
        content = text
    else:
        return {"Error": "Invalid data"}
        

    clean_text = process_email(content)
    category = classify_email(clean_text)
    response = generate_response(category)

    return {
        "category": category,
        "response": response
    }
