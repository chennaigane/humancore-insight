import streamlit as st
import pandas as pd
import time

# Sample data for illustration, can be replaced with dynamic data from a database
employee_data = {
    'Employee Name': ['John Doe', 'Jane Smith', 'Emma Lee'],
    'Task': ['Task 1', 'Task 2', 'Task 3'],
    'Time Spent (hours)': [4, 5, 6],
    'Activity': ['Active', 'Idle', 'Active']
}

# Convert the data to a DataFrame
df = pd.DataFrame(employee_data)

# Create a time log dictionary to track task start/stop times
time_log = {}

def main():
    st.title("Employee Monitoring Dashboard")

    st.write("This application tracks employee activity during work hours.")
    
    # Display employee activity in a table
    st.subheader("Employee Activity")
    st.dataframe(df)

    # Task Tracker feature (Start and Stop Task)
    st.subheader("Task Time Tracker")
    
    task = st.selectbox("Select Task", df['Task'])
    employee = st.selectbox("Select Employee", df['Employee Name'])
    
    # Check if the employee has a timer running
    if employee not in time_log:
        time_log[employee] = {}
    
    # Display the current task for the selected employee
    if task in time_log[employee]:
        task_time = time_log[employee][task]
        st.write(f"Currently working on: {task} | Time Spent: {task_time} seconds")

    # Task control buttons (Start/Stop)
    start_button = st.button("Start Task")
    stop_button = st.button("Stop Task")

    if start_button:
        time_log[employee][task] = time.time()  # Store start time
        st.write(f"Started {task} at {time.strftime('%H:%M:%S')}")

    if stop_button:
        if task in time_log[employee]:
            start_time = time_log[employee][task]
            time_spent = round(time.time() - start_time, 2)  # Calculate time spent
            st.write(f"Stopped {task} at {time.strftime('%H:%M:%S')}")
            st.write(f"Total time spent on {task}: {time_spent} seconds")
            # Update the DataFrame with the time spent
            df.loc[df['Employee Name'] == employee, 'Time Spent (hours)'] = time_spent / 3600  # Convert seconds to hours

    # Button to refresh activity data
    if st.button("Refresh Activity Data"):
        st.dataframe(df)

if __name__ == "__main__":
    main()
import streamlit as st

st.set_page_config(page_title="Metrx", page_icon="📊", layout="centered")

st.markdown(
    """
    <style>
    .stApp {background:#fffb00;}
    .box {
        max-width: 520px; margin: 4rem auto; padding: 2rem;
        background: rgba(255,255,255,0.25); border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
    }
    .title {text-align:center; font-weight:700; font-size:2rem; margin-bottom:0.25rem;}
    .brand {text-align:center; font-size:1rem; opacity:0.9; margin-bottom:1.25rem;}
    .mode {display:flex; gap:1rem; justify-content:center; margin-bottom:1rem;}
    </style>
    """,
    unsafe_allow_html=True,
)

with st.container():
    st.markdown('<div class="box">', unsafe_allow_html=True)
    st.markdown('<div class="title">Welcome to Metrx</div>', unsafe_allow_html=True)
    st.markdown('<div class="brand">User Login</div>', unsafe_allow_html=True)

    tab1, tab2 = st.tabs(["User Login", "Admin Login"])
    with tab1:
        email = st.text_input("User Email", placeholder="Enter your user email")
        pwd = st.text_input("Password", type="password", placeholder="Enter your password")
        if st.button("Sign In as User", use_container_width=True):
            st.success(f"Signed in as {email or 'user'} (demo)")

        st.caption("Forgot your password?")

    with tab2:
        aemail = st.text_input("Admin Email", key="a1", placeholder="Enter admin email")
        apwd = st.text_input("Admin Password", key="a2", type="password")
        if st.button("Sign In as Admin", use_container_width=True):
            st.info(f"Signed in as admin {aemail or 'admin'} (demo)")

    st.markdown("</div>", unsafe_allow_html=True)
