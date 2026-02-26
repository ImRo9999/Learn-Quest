# prepare_dataset.py
import pandas as pd
import re

# Load original dataset
df = pd.read_csv('ai_job_market_insights.csv')

# Columns to clean
text_cols = ['Job_Title', 'Industry', 'Company_Size', 'Location', 'AI_Adoption_Level', 'Required_Skills']

def clean_text(text):
    if pd.isna(text):
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)  # Replace special chars with space
    text = re.sub(r'\s+', ' ', text).strip()  # Remove extra spaces
    return text

# Apply cleaning
for col in text_cols:
    df[col] = df[col].apply(clean_text)

# Save cleaned dataset
df.to_csv('cleaned_ai_job_market_insights.csv', index=False)

print("✅ Cleaned dataset saved as cleaned_ai_job_market_insights.csv")
