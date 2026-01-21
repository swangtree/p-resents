# 1. Start from an official Python base image
FROM python:3.9

# 2. Set the working directory inside the container
WORKDIR /code

# 3. Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 4. Copy the rest of the application code
COPY . .

# 5. Define the command to run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "80"]