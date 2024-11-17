# Use the official Python base image
FROM python:3.9

# Install Jupyter
RUN pip install --no-cache-dir notebook

# Set the working directory to /app
WORKDIR /app

# Expose port 8888 for the Jupyter server
EXPOSE 8888

# Run Jupyter Notebook with the current directory as the working directory
CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root", "--notebook-dir=/app"]
