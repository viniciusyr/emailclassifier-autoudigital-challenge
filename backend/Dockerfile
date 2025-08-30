FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -m nltk.downloader punkt punkt_tab stopwords wordnet \
    && python -c "import nltk; nltk.data.path.append('/usr/local/nltk_data')" 

ENV NLTK_DATA=/usr/local/nltk_data

COPY . .

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
