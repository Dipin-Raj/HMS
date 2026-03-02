import pandas as pd
from typing import Any, Dict, List, Optional

def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    """
    Performs basic data cleaning on a Pandas DataFrame.
    - Handles missing values (fills with mode for categorical, median for numerical).
    - Removes duplicate rows.
    """
    df = df.copy()

    # Handle missing values
    for column in df.columns:
        if df[column].isnull().any():
            if df[column].dtype == 'object' or df[column].dtype == 'bool': # Categorical
                mode_val = df[column].mode()[0]
                df[column] = df[column].fillna(mode_val)
            else: # Numerical
                median_val = df[column].median()
                df[column] = df[column].fillna(median_val)
    
    # Remove duplicate rows
    df.drop_duplicates(inplace=True)

    return df

def validate_input_data(data: Dict[str, Any], required_fields: List[str]) -> bool:
    """
    Validates if all required fields are present in the input data dictionary.
    """
    for field in required_fields:
        if field not in data or data[field] is None:
            return False
    return True

def standardize_text(text: str) -> str:
    """
    Standardizes text by converting to lowercase and stripping whitespace.
    """
    return text.strip().lower()
