import streamlit as st

def main():
    st.title("Welcome to Hugging Face Deployment")
    st.write("This is a simple app deployed using Streamlit on Hugging Face.")
    st.text_area("Enter some text", "Hello, Hugging Face!")

if __name__ == "__main__":
    main()
