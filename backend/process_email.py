import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer

nltk.download("punkt")
nltk.download("punkt_tab")
nltk.download("stopwords")
nltk.download("wordnet")

stop_words = set(stopwords.words("portuguese"))
stemmer = PorterStemmer()
lemmatizer = WordNetLemmatizer()

def process_email(text: str, use_stemming=False, use_lemmatization=True) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = nltk.word_tokenize(text)
    tokens = [t for t in tokens if t not in stop_words]

    if use_stemming:
        tokens = [stemmer.stem(t) for t in tokens]
    elif use_lemmatization:
        tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens)
