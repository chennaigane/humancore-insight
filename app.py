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
